# ee-rate limit


## installation
	
	npm install ee-rate-limiter

## usage

	// limit to 100 items / minute
	var rate = new RateLimiter( { rate: 100, range: 60 } );


	if ( rate.ok() ){
		// ok

	}
	else {
		// rate limit exceeded

	}