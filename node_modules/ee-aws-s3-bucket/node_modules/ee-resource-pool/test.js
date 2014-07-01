


	var ResourcePool 	= require( "./" )
		, log 			= require( "ee-log" )
		, Class			= require( "ee-class" )
		, assert 		= require( "assert" )
		, idCounter 	= 0
		, jobsDone 		= 0
		, resources		= 0
		, idling 		= false;




	var Resource = new Class( {

		init: function(){	
			this.id = ++idCounter;
		}


		, do: function(){
			log( "resource %s is beeing used ...", this.id );
			setTimeout( function(){
				log( "resource %s is beeing freed, job %s completed ...", this.id, ++jobsDone );
				
				this.free();
			}.bind( this ), 500 );
		}
	} );



	var pool = new ResourcePool( {
		  maxWaitingRequests: 10000
		, timeout: 3600000
	} );

	pool.on('idle', function(){ 
		idling = true;
		assert.ok( jobsDone === 100, "There should have been 100 jobs done, but i counted " + jobsDone );
		assert.ok( resources === 10, "There should have been 20 resource events emitted, but i counted " + resources );
		process.exit();
	});

	pool.on('resource', function(){ resources++; });


	for( var i = 0, l = 10; i < l; i++ ){
		pool.add( new Resource() );
	}



	for( var i = 0, l = 100; i < l; i++ ){
		pool.get( function( err, res ){
			log.trace( err );
			if ( res ) res.do();
		} );
	}




	process.on( "exit", function(){
		assert.ok( idling === true, "the idle event was not emitted!" )
	} );