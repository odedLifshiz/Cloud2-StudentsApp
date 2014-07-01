


	var   Queue 	= require( "./" )
		, log 		= require( "ee-log" )
		, assert 	= require( "assert" )
		, hadError 	= false
		, timeouts 	= 0;


	// queue with items which expire after 100 msec. The queue overflows 
	// after 1'000'000 items, but you can configure that value via the
	// «max» attribute. the queue cannot hold unlimited items, so settings
	// «max» to 0 will cause the queue to reject new items
	var q = new Queue( { 
		  ttl: 1000
		, max: 9 
		, on: {
			timeout: function( item ){ timeouts++; }
			, error: function( err, item ){ 
				assert.ok( err instanceof Error, "Error event did not deliver an error object" );
				hadError = true;
			}
		}
	} );


	var i = 10;
	while( i-- ){
		q.queue( i );
	}

	var x = typeof q.get();
	assert.ok( x === "number", "Got " + x + "expected number!" );


	process.on( "exit", function(){
		assert.ok( hadError, "Error event was not triggered!" );
		assert.ok( timeouts === 8, "Wrong number of timeout events fired, expected 8, got " + timeouts );
	} );