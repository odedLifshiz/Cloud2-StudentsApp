

	var   Class 		= require( "ee-class" )
		, EventEmitter 	= require( "ee-event-emitter" )
		, Queue 		= require( "ee-ttl-queue" )
		, type 			= require( "ee-types" )
		, RateLimiter 	= require( "ee-rate-limiter" )
		, log 			= require( "ee-log" );


	var Resource 		= require( "./Resource" );




	module.exports = new Class( {
		inherits: EventEmitter


		// there should always be x percent resources in stock, so we've never to wait when whe request one
		// default: 0 -> no prefetching
		, prefetch: 0

		// how long should it take to emit a timeout error for a resource request ( ms )
		// default: 0 -> no timeout
		, timeout: 0

		// maximum # of waiting requests
		// default: 100'000 
		, maxWaitingRequests: 100000

		// free resources ( close them ) after x ms
		// default: 0 -> resources will never bee freed
		, idle: 0

		// maximum resources which may be allocated by the pool ( via the «resouceRequest» event )
		// default: 0 -> no limit
		, max: 0

		// maximum number of resource requests / second
		// default: 0 -> no limit
		, rateLimit: 0


		// references to all free resources
		, resources: null


		// flags if there is nede for fake resources ( false -> fake resources )
		, useResources: false


		// number of busy resources
		, busy: 0

		// number of requested resources
		, requested: 0

		// number of free resources
		, free: 0

		// usage counter
		, tasks: 0

		// number of total resources
		, total: {
			  get: function() { return this.busy + this.free; }
			, enumerable: true
		}

		// percent of free resources
		, freePercent: {
			  get: function() { return this.free / this.total * 100; }
			, enumerable: true
		}

		// percent of busy resources
		, busyPercent: {
			  get: function() { return this.busy / this.total * 100; }
			, enumerable: true
		}

		// percent of prefetched resources in relation to the number of currently busy or waiting jobs
		, prefetchPercent: {
			  get: function() { return this.queue.length + this.busy === 0 ? 0 : ( this.free + this.requested ) / ( this.queue.length + this.busy ) * 100; }
			, enumerable: true
		}


		, init: function( options ){
			if (!options) options = {};

			this.resources = [];

			if ( type.number( options.prefetch ) ) 				this.prefetch 			= options.prefetch;
			if ( type.number( options.timeout ) ) 				this.timeout 			= options.timeout;
			if ( type.number( options.idle ) ) 					this.idle 				= options.idle;
			if ( type.number( options.max ) ) 					this.max 				= options.max;
			if ( type.number( options.rateLimit ) ) 			this.rateLimit 			= options.rateLimit;
			if ( type.number( options.maxWaitingRequests ) ) 	this.maxWaitingRequests = options.maxWaitingRequests;

			this.queue = new Queue( {
				  max: this.maxWaitingRequests
				, ttl: this.timeout
			} );

			this.queue.on('timeout', this.handleQueueTimeout.bind( this ));
			this.queue.on('error', this.handleQueueOverflow.bind( this ));

			// support for rate lmimting
			this.rate = new RateLimiter( { rate: this.rateLimit } );

			// start loading resources whne there is nede to prefetch them
			process.nextTick( function(){
				this.requestResoure();
			}.bind( this ) );


			if (this.rateLimit) {
				this.intervalTime = Math.round(1000/this.rateLimit);
				if (this.intervalTime < 100) this.intervalTime = 100;

				this.interval = setInterval(function(){
					while(this.queue.length){
						if ( this.free > 0 && this.rate.ok() ) {
							var res = this.resources.shift();
							this.queue.get()(null, res.use());
						}
						else break;
					}
				}.bind(this), this.intervalTime);
			}
		}


		, handleQueueTimeout: function( callback ){
			callback( new Error( "Timeout while waiting for a free resource" ).setName( "CapacityOverloadException" ) );
		}

		, handleQueueOverflow: function( error, callback ){
			callback( new Error( "Error while queueing resource" ).setName( "CapacityOverloadException" ) );
		}


		, add: function( resource ){
			var res;

			this.useResources = true;
			this.busy++;

			res = new Resource({ 
				  resource: resource 
				, idleTimeout: this.idle
			});

			res.on('free', this.onFreeResource.bind(this));
			res.on('busy', this.onBusyResource.bind(this));
			res.on('close', this.onCloseResource.bind(this));
		}


		, onCloseResource: function( resource ){
			if ( resource.busy ) this.busy--;
			else {
				var idx = this.resources.indexOf( resource );
				if ( idx >= 0 ) this.resources.splice( idx, 1 );
				else throw new Error( "failed to remove resources from free resources!" );
				this.free--;
			}
		}


		, onFreeResource: function( resource ){
			this.busy--;
			this.free++;

			if ( this.queue.length > 0 && this.rate.ok() ){
				this.queue.get()( null, resource.use() );
			}
			else {
				this.resources.push( resource );
				this.emit( "resource" );

				if ( this.freePercent === 100 && this.queue.length === 0 && this.tasks > 0 ){
					this.emit( "idle" );
				}
			}
		}


		, onBusyResource: function( resource ){
			this.busy++;
			this.free--;

			this.requestResoure();
		}


		, requestResoure: function(){
			// get more resources if required and allowed
			if ( ( this.queue.length > 0 || ( this.prefetch > 0 && this.prefetchPercent < this.prefetch ) ) && ( this.max === 0 || ( this.total + this.requested ) < this.max ) ){
				this.requested++;

				if( !this.useResources && this.listener( "resourceRequest" ).length === 0 ){
					// if noone is listening for resource requests we dont need to request them, we can work with fakeresources
					this.handleRequestedResource( {} );
				}
				else {
					// get a resource
					this.emit( "resourceRequest", this.handleRequestedResource.bind( this ) );
				}
			}
		}


		, handleRequestedResource: function( resource ){
			this.requested--;
			if ( resource ) this.add( resource );
		}



		, get: function( callback ){
			this.tasks++;

			if ( this.free > 0 && this.rate.ok() ) {
				var res = this.resources.shift();
				callback ( null, res.use() );
			}
			else {
				this.queue.queue( callback );
				this.requestResoure();
			}
		}
	} );