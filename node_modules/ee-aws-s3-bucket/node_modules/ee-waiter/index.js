
	
	var Class = require( "ee-class" );



	module.exports = new Class( {

		  __jobs: []
		, __finishedCount: 0
		, __callback: null


		, init: function( callback ){
			if ( callback ) this.__callback = callback;
		}


		, add: function( job ){
			this.__jobs.push( job );
			return this;
		}


		, __complete: function( err ){
			if ( err ) this.cancel( err );
			else {
				this.__finishedCount++;
				if ( this.__finishedCount === this.__jobs.length ){
					if ( this.__callback ) this.__callback();
				}
			}
		}


		, cancel: function( err ){
			if ( this.__callback ) {
				this.__callback( err );
				delete this.__callback;
			}
		}

		, start: function( callback ){
			var i = this.__jobs.length;

			if ( callback ) this.__callback = callback;

			if ( i > 0 ){
				while( i-- ){
					this.__jobs[ i ]( this.__complete.bind( this ) );
				}
			}
			else {
				if ( this.__callback ) this.__callback();
			}
		}
	} );