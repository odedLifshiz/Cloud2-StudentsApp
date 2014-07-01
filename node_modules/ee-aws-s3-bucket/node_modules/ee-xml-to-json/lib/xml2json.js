

	var   Class 		= require( "ee-class" )
		, log 			= require( "ee-log" )
		, type 			= require( "ee-types" )
		, arg 			= require( "ee-arguments" )
		, parseString 	= require( "xml2js" ).parseString
		, transform 	= require( "./transform" );



	module.exports = function(){
		var callback = arg( arguments, "function" );
		var transformationRules = arg( arguments, "object" );
		var data = arg( arguments, "buffer" );
		if ( !data ) data = arg( arguments, "string" );


		var resume = function( err, data ){
			if ( err ) callback( err );
			else if ( !data ) callback();
			else {
				if ( transformationRules ){
					callback( null, transform( data, transformationRules ) );
				}
				else{
					callback( null, data );
				}
			}
		}


		if ( type.buffer( data ) ) {
			parseString( data.toString(), resume );
		}
		else if ( type.string( data ) ){
			parseString( data, resume );
		}
		else {
			callback( new Error( "Expected «string» or «Buffer» as parameter 1!" ).setName( "InvalidArgumentException" ) );
		}		
	}