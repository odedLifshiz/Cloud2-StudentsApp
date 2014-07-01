

	var   Class 		= require( "ee-class" )
		, EventEmitter 	= require( "ee-event-emitter" )
		, type 			= require( "ee-types" )
		, log 			= require( "ee-log" );


	module.exports = new Class( {
		inherits: EventEmitter

		, init: function( options ){
			this.resource = options.resource;
			this.idleTimeout = options.idleTimeout;

			this.resource.freeResource = this.free.bind( this );
			this.resource.closeResource = this.close.bind( this );

			// shorthand methods if not used otherwise
			if ( !this.resource.free ) this.resource.free = this.free.bind( this );
			if ( !this.resource.close ) this.resource.close = this.close.bind( this );


			this.busy = false;
			process.nextTick(function(){
				this.free();
			}.bind(this));
		}

		, use: function(){
			this.busy = true;
			this.emit( "busy", this );
			return this.resource;
		}


		, close: function(){
			// close
			this.emit( "close", this );
		}


		, free: function(){
			this.emit( "free", this );

			if ( type.number( this.idleTimeout ) && this.idleTimeout > 0 ){
				this.timeout = setTimeout( this.close.bind( this ), this.idleTimeout );
			}
		} 
	} );