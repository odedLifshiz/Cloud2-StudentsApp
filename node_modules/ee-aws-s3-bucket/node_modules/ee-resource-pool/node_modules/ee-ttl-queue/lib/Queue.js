


	var   Class 		= require( "ee-class" )
		, EventEmitter 	= require( "ee-event-emitter" )
		, type 			= require( "ee-types" )
		, log 			= require( "ee-log" );





	module.exports = new Class( {
		inherits: EventEmitter

		, itemqueue: 	[]

		// maximum number oif items
		// default: 0 -> will crash the process if too many itemsa are added
		, max: 		0

		// time to live for each item
		// deault: 0 -> items will never expire
		, ttl: 		0


		, init: function( options ){
			if ( type.number( options.max ) ) this.max = options.max;
			if ( type.number( options.ttl ) ) this.ttl = options.ttl;
		}


		, get: function(){
			if ( this.length > 0 ) return this.itemqueue.shift().item;
			else return null;
		}


		, add: function(){
			return this.queue.apply( this, Array.prototype.slice.call( arguments, 0 ) );
		}


		, queue: function( item ){
			if ( this.max === 0 || this.length < this.max ){
				this.itemqueue.push( { item: item, timeout: Date.now() + this.ttl } );
				if ( this.ttl > 0 && type.undefined( this.timeout ) ) this.doTimeout();
				return true;
			}
			else this.emit( "error", new Error( "the queue holds currently «"+this.length+"» items which is the configured maximum!"  ).setName( "OverflowException" ), item );
			return false;
		}


		, remove: function( item ){
			var i = this.length;
			while( i-- ) if ( this.itemqueue[ i ].item === item ) return this.itemqueue.splice( i, 1 )[ 0 ];
			return null;
		}


		, doTimeout: function(){
			while( this.length > 0 && this.itemqueue[ 0 ].timeout <= Date.now() ){
				this.emit( "timeout", this.itemqueue.shift().item );
			}

			if ( this.length > 0 ) this.timeout = setTimeout( this.doTimeout.bind( this ), this.itemqueue[ 0 ].timeout - Date.now() );
		}


		, get length(){
			return this.itemqueue.length;
		}
	} );