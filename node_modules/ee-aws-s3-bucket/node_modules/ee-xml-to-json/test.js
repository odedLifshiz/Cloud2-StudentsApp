
	

	var   Class 		= require( "ee-class" )
		, log 			= require( "ee-log" )
		, fs 			= require( "fs" ) 
		, assert 		= require( "assert" );



	var   xml2json 		= require( "./" )
		, rules 		= require( "./test/rules" )
		, xml 			= fs.readFileSync( "./test/aws.xml" )
		, result 		= require( "./test/result.js" );


	xml2json( xml, rules, function( err, json ){
		assert.ifError( err );
		assert.deepEqual( json, result, "parsed xml result does not equal to the contents of the result.js file" );
	}.bind( this ) );

