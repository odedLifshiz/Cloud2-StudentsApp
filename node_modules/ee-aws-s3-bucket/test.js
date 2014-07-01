


	var   Class 		= require( "ee-class" )
		, log 			= require( "ee-log" )
		, project 		= require( "ee-project" )
		, fs 			= require( "fs" )
		, assert 		= require( "assert" );



	var   S3Bucket 	= require( "./" )
		, file1 	= fs.readFileSync( "./test/1.jpg" )
		, bucket 	= new S3Bucket( project.config || {
		      key:      project.config.key
		    , secret:   project.config.secret
		    , bucket:   project.config.bucket
		    , maxConcurrentUploads: 2
		} );


	bucket.put( "/test/private/1e.jpg", "Image/Jpeg", file1, true, function( err ){
		if ( err ) log.trace( err );
		else {
			log.info( "file1 e pushed" );

			bucket.delete( "/test/private/1e.jpg", function( err, headers ){
				if ( err ) log.trace( err );
				else {
					log.warn( "file removed" );
					log( headers );	
				}
			}.bind( this ) );
		}
	} );


	bucket.put( "/test/private/1f.jpg", "Image/Jpeg", file1, true, function( err ){
		if ( err ) log.trace( err );
		else log.info( "file1 f pushed" );
	} );
	

	bucket.list( "/", function( err, file, headers ){
		if ( err ) log.trace( err );
		else {
			log( headers );
			log( file );
		}
	} );



	bucket.get( "/test/private/1f.jpg", function( err, file, headers ){
		if ( err ) log.trace( err );
		else {
			log( headers );
			fs.writeFile( "./test/downlaoded.jpg", file );
		}
	} );


	bucket.head( "/test/private/1f.jpg", function( err, headers ){
		if ( err ) log.trace( err );
		else {
			log.error('head', headers );
		}
	} );


	bucket.delete( "/test/private/", function( err, headers ){
		if ( err ) log.trace( err );
		else {
			log.warn( "file removed" );
			log( headers );	
		}
	}.bind( this ) );

			