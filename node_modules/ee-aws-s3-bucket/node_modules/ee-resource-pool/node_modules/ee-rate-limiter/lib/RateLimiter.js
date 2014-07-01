


	var   Class = require( "ee-class" )
		, log 	= require( "ee-log" )
		, type 	= require( "ee-types" );



	module.exports = new Class( {

		// rate limit per n seconds
		// default: 0 -> no limit
		rate: 0

		// range in which the limit must be set
		// default: 1 -> rate per 1 seconds
		, range: 1


		, init: function( options ){
			if ( type.number( options.rate ) ) this.rate = options.rate;
			if ( type.number( options.range ) ) this.range = options.range;

			this.allowance = this.rate;
			this.ratio = this.rate / this.range;
			this.lastCheck = process.hrtime();
		}


		, ok: function( num ){
			return !this.limit( num );
		}


		, limit: function( num ){
			if ( this.rate === 0 ) return false;
			else {
				var   current 	= process.hrtime()
					, diff 		= this.diff( process.hrtime( this.lastCheck ) );

				this.lastCheck = current;

				this.allowance += diff * this.ratio; 
				if ( this.allowance > this.rate ) this.allowance = this.rate;

				//log( diff, diff * this.ratio, this.allowance, this.allowance < 1 );

				if ( this.allowance <= 1 ) return true;
				else {
					this.allowance -= ( num || 1 );
					return false;
				}
			}
		}



		, now: function(){
			var t = process.hrtime();
			return t[ 0 ] + "." + this.pad( t[ 1 ] + "" );
		}

		, diff: function( t ){
			return t[ 0 ] + "." + this.pad( t[ 1 ] + "" );
		}

		, pad: function( item ){
			if ( item.length >= 9 ) return item;
			else return new Array( 10 - item.length ).join( "0" ) + item;
		}
	} );