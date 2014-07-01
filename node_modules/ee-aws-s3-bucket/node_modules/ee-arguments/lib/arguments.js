
	var   type 	= require( "ee-types" )
		, log 	= require( "ee-log" );


	module.exports = function( theArguments, argumentType, defaultValue, index ){
		if ( type.string( argumentType ) && type.object( theArguments ) ){
			var args = Array.prototype.slice.call( theArguments, 0 );
			index = index || 0;

			for ( var i = 0, l = args.length; i < l; i++ ){
				if ( type( args[ i ] ) === argumentType ){
					if ( index === 0 ) return args[ i ];
					else index--;
				}
			}
			return defaultValue;
		}
		else throw new Error( "expecting at least the «arguments» object and the «type» arguments!" );
	}
