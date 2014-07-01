# ee-aws-s3-bucket

Easy AWS S3 Bucket implementation. Upload, download and delete ( recursive ) files from your buckets.

## installation

	npm install ee-aws-s3-bucket

## API

### Constructor

	var S3Bucket = require( "ee-aws-s3-bucket" );

	var myBucket = new S3Bucket( {
		  key: 		""
		, secret: 	""
		, bucket: 	""
		, maxConcurrent: 10 				// generic limit, overrrides the default of 10
		, maxConcurrentDownloads: 100 		// limit to 100 concurrent downloads, overrides the generic limit
		, maxConcurrentUploads: 50 			// limit to 50 concurrent uploads, overrides the generic limit
		, maxConcurrentDeletes: 200 		// limit to 200 concurrent deletes, overrides the generic limit
		, maxConcurrentLists: 5 			// limit to 5 concurrent lists, overrides the generic limit
	} );


### upload file

	// put ( upload ) an object into your S3 bucket
	myBucket.put( path, data, [ callback( err ){} ], [ contentType ], [ headers ], [ private ] );

you may pass the arguments below in any order as long the first string argument is the path for the file

- path: string, where to put the file ( mandatory )
- data: string or buffer, the actual data ( mandatory )
- callback: function, called when the upload finished or faield ( optional )
- contentType: string, the content type header ( content type of the file, optional )
- headers: object, you may pass any headers you wish ( optional )
- private: flags a file as private or publid ( defaults ot private, optional ) 
	
	
#### example
	
	myBucket.put( "/test/file1.jpg", fs.readfileSync( "./test/file1.jpg" ), "Image/Jpeg", function( err ){
		if ( err ) log.trace( err );
		else {
			log.info( "file was uploaded ..." );
		}
	} );


### list files

list files which have a certain path prefix, e.g. if you list «/te» all files in the «/test/» directory but also the «/test.js» will be listed.

	myBucket.list( path, callback( err, list, next ){} );

- path: string, where to put the file ( mandatory )
- callback: function, called when the list was returned. if the list contains > 1'000 entries a next callback parameter will be delivered ( mandatory )  

#### example

	var handleListResult = function( err, list, next ){
		if ( err ) log.trace( err );
		else {
			log( list );

			// get the next 1'000 items if available
			if( next ) next( handleListResult );
		}
	};

	myBucket.list( "/test/", handleListResult );


### download files

	// get ( download ) an object from your S3 bucket
	myBucket.get( path, callback( err, file, headers ){} );

- path: string, where to put the file ( mandatory )
- callback: function, called when the download finished or faield ( mandatory )


#### example
	
	myBucket.get( "/test/file1.jpg", function( err, data, headers ){
		if ( err ) log.trace( err );
		else {
			fs.writeFile( "./test/downlaodedfile.jpg", data );
			log( headers );
		}
	} );


### delete files

you may either delete a directory or a single file, if you wish to delete a directory you have to end the path with a «/».

	// delete one or more object from your S3 bucket
	myBucket.delete( path, callback( err ){} );

- path: string, where to put the file ( mandatory )
- callback: function, called when the file / directory was deleted or the operation failed ( mandatory )


#### example
	
	// delete a file
	myBucket.delete( "/test/file1.jpg", function( err ){
		if ( err ) log.trace( err );
		else {
			log.info( "file was deleted" );
		}
	} );


	// delete all files in a directory
	myBucket.delete( "/test/", function( err ){
		if ( err ) log.trace( err );
		else {
			log.info( "folder was deleted" );
		}
	} );
