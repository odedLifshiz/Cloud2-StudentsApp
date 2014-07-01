# ee-error

Extends the native error object with a setName & setDescription method

## installation

npm install ee-error

## usage
	
	// load the module in the root of your project
	require( "ee-error" );


	try{
		throw new Error( "not good! you created a try catch block without any useful functionality!" ).setName( "NotGoodException" );
	}
	catch ( err ) {
		if ( err.name === "NotGoodException" ){
			console.log( err ); // { [NotGoodException: not good! you created a try catch block without any useful functionality!] name: 'NotGoodException' }
		}
	}


if you're using the ee-log class the output of log.trace( err ) would look like this:

	23 11:11:32.159 > /test.js 12:6, Object.<anonymous>             >>> [Trace]
	--------------------------------------------------------------------------------
	NotGoodException: not good! you created a try catch block without any useful functionality!
	--------------------------------------------------------------------------------
	                      /test.js   12:13  Object.<anonymous>
	                     module.js  456:26  Module._compile
	                     module.js  474:10  Object.Module._extensions..js
	                     module.js  356:32  Module.load
	                     module.js  312:12  Function.Module._load
	                     module.js  497:10  Function.Module.runMain
	                       node.js  119:16  startup
	                       node.js  901:3   
	--------------------------------------------------------------------------------



