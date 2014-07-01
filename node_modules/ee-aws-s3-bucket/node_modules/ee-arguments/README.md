# ee-arguments

assign values passed to a function to a variable by their type and optional by their index. you may pass also a default value for each variable

## installation

	npm install ee-arguments

## usage


	// syntax
	var myVariable = arg( arguments, expectedType, [defaultValue], [index] );

	var   arg = require( "ee-arguments" )
		, log = require( "ee-log" );


	var test = function(){
		var callback = arg( arguments, "function", function(){ log.info( "default function" ); } );
		callback();
	}


	// prints «default function»
	test(); 

	// prints «custom function»
	test( function(){ log.info( "custom function" ); } );

	// prints «custom function»
	test( 1, null, new Error(), function(){ log.info( "custom function" ); }, "fancy_string" ); 





