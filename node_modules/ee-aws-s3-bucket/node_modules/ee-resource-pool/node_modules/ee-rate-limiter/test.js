



	var RateLimiter = require( "./" );



	// limit to 5 tiems / second
	var rate = new RateLimiter( {
		  rate: 10
		, range: 1
	} );




	var executed = rejected = 0
		, total = 250
		, started = Date.now();


	var interval = setInterval( function(){
		if ( rate.limit() ) rejected++;
		else executed++;

		total--;

		if ( total === 0 ) {
			clearInterval( interval );
			console.log( "executed:", executed );
			console.log( "rejected:", rejected );
			console.log( "time passed:", Date.now() - started );
			console.log( "rate was", executed / ( ( Date.now() - started ) / 1000 ) );
		}
		console.log( total );
	}, 10 );