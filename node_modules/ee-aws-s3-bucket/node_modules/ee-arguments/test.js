


	var   arg = require( "./" )
		, log = require( "ee-log" );


	var test = function(){
		log.warn( "-----------" );
		var callback 		= arg( arguments, "function", function(){ log.info( "default" ); } );
		var config 			= arg( arguments, "object", {} );
		var optionalData 	= arg( arguments, "object", null, 1 );

		callback();
		log( config, optionalData );
	}


	test();
	test( function(){ log.info( "from argumnet" ); } );
	test( { config: true } );
	test( { config: true }, function(){ log.info( "from argumnet" ); } );
	test( { config: true }, function(){ log.info( "from argumnet" ); }, { optional: true } );



	