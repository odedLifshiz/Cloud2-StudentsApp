


	require( "./" );




	var log = require( "ee-log" );


	log.trace( new Error( "not good! you created a try catch block without any useful functionality!" ).setName( "NotGoodException" ) );