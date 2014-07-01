	

	var   Class 		= require( "ee-class" )
		, Waiter 		= require( "ee-waiter" )
		, log 			= require( "ee-log" )
		, type 			= require( "ee-types" )
		, arg 			= require( "ee-arguments" )
		, ResourcePool	= require( "ee-resource-pool" )
		, request 		= require( "request" )
		, xml2json 		= require( "ee-xml-to-json" )
		, rules 		= require( "../transformations/list" );





	module.exports = new Class( {

		  pool: {}
		, max: { default: 10 }


		, init: function( options ){
			options = options || {};
			
			if ( !type.string( options.key ) ) 		throw new Error( "missing the string property «key» on the options object!" ).setName( "MissingArgumentException" );
			if ( !type.string( options.secret ) ) 	throw new Error( "missing the string property «secret» on the options object!" ).setName( "MissingArgumentException" );
			if ( !type.string( options.bucket ) ) 	throw new Error( "missing the string property «bucket» on the options object!" ).setName( "MissingArgumentException" );


			this.credentials = {
				  key: 		options.key
				, secret: 	options.secret
				, bucket: 	options.bucket
			};

			// limits
			if ( type.number( options.maxConcurrent ) ) 			this.max.generic 	= options.maxConcurrent;
			if ( type.number( options.maxConcurrentDownloads ) ) 	this.max.download 	= options.maxConcurrentDownloads;
			if ( type.number( options.maxConcurrentUploads ) ) 		this.max.upload 	= options.maxConcurrentUploads;
			if ( type.number( options.maxConcurrentLists ) ) 		this.max.list 		= options.maxConcurrentLists;
			if ( type.number( options.maxConcurrentDeletes ) ) 		this.max.delete 	= options.maxConcurrentDeletes;

			// initialize pools
			this.initialize();
		}





		, list: function(){
			this.execute( "list", arguments );
		}

		, _list: function( path, callback, offset ){
			request( {
				  url:  		"https://" + this.credentials.bucket + ".s3.amazonaws.com/?prefix=" + path.substr( 1 )
				, method: 		"GET"
				, aws: 			this.credentials
				, encoding: 	null
				, timeout: 		60000 // 60 secs
			}, function( err, response, body ){
				if ( err ) callback ( err );
				else {
					if ( response && response.statusCode === 200 ){
						xml2json( body, rules, function( err, data ){
							if ( err ) callback( err );
							else {
								var next;

								if ( data && data.contents && data.contents.length > 0 ){
									data.contents.forEach( function( obj ){
										obj.file = obj.key.substr( obj.key.lastIndexOf( "/" ) +1 );
									} );
								}

								if ( data && data.truncated ){
									next = function( newCallback ){
										this.list( path, newCallback, data.contents[ data.contents.length - 1 ].key );
									}.bind( this );
								}

								data = data.contents;

								callback( null, data, next );
							}
						}.bind( this ) );
					}
					else callback( new Error( "Listing failed, status: "+response.statusCode ).setName( "ListingFailedException" ) );
				}
			}.bind( this ) );
		}




		, delete: function( path, callback ){

			// deleting a file or a directory?
			if ( path && path.length > 0 && path.substr( path.length - 1, 1 ) === "/" ){

				var deleteList = function( err, list, next ){
					if ( list && list.length > 0 ){
						var deleteQueue = new Waiter();

						list.forEach( function( item ){
							deleteQueue.add( function( cb ){
								this.delete( "/" + item.key, cb  );
							}.bind( this ) );
						}.bind( this ) );

						deleteQueue.start( function( err ){
							if ( err ) callback( err );
							else if ( next ) next( deleteList );
							else callback();
						}.bind( this ) );
					}
					else callback();
				}.bind( this );

				// delete a entire directories
				this.list( path, deleteList );
			}
			else this.execute( "delete", arguments );
		}



		, _delete: function( path, callback, url ){
			request( {
				  url:  		"https://" + this.credentials.bucket + ".s3.amazonaws.com" + path
				, method: 		"DELETE"
				, aws: 			this.credentials
				, encoding: 	null
				, timeout: 		60000 // 60 secs
			}, function( err, response, body ){
				if ( err ) callback ( err );
				else {
					if ( response ) {
						 if (response.statusCode === 204) callback( null, response.headers );
						 else if (response.statusCode === 307) this._delete(path, callback, response.headers.location);
						 else callback( new Error( "Deletion failed, status: "+response.statusCode ).setName( "DeletionFailedException" ) );
					}
					else callback( new Error( "Deletion failed, unknown status!").setName( "DeletionFailedException" ) );
				}
			}.bind( this ) );
		}




		, head: function() {
			this.execute( "head", arguments );
		}

		, _head: function(path, callback, url) {
			request( {
				  url:  		url || ("https://" + this.credentials.bucket + ".s3.amazonaws.com" + path)
				, method: 		"HEAD"
				, aws: 			this.credentials
				, encoding: 	null
				, timeout: 		60000 // 60 secs
			}, function( err, response, body ){
				if ( err ) callback ( err );
				else {
					if (response) {
						if (response.statusCode === 200) callback( null, response.headers );
						else if (response.statusCode === 307) this._head(path, callback, response.headers.location);
						else callback( new Error( "Download failed, status: "+response.statusCode ).setName( "DownloadFailedException" ), response.statusCode );
					}
					else callback(new Error("Download failed, unknown status!").setName( "DownloadFailedException" ), response.statusCode );
				}
			}.bind( this ) );
		}





		, get: function(){
			this.execute( "get", arguments );
		}

		, _get: function( path, callback, url ){
			request( {
				  url:  		url || ("https://" + this.credentials.bucket + ".s3.amazonaws.com" + path)
				, method: 		"GET"
				, aws: 			this.credentials
				, encoding: 	null
				, timeout: 		60000 // 60 secs
			}, function( err, response, body ){
				if ( err ) callback ( err );
				else {
					if (response) {
						if (response.statusCode === 200) callback( null, body, response.headers );
						else if (response.statusCode === 307) this._get(path, callback, response.headers.location);
						else callback( new Error( "Download failed, status: "+response.statusCode ).setName( "DownloadFailedException" ), response.statusCode );
					}
					else callback(new Error("Download failed, unknown status!").setName( "DownloadFailedException" ), response.statusCode );
				}
			}.bind( this ) );
		}





		, put: function(){
			this.execute( "put", arguments );
		}

		, _put: function(){
			var   path 			= arg( arguments, "string" )
				, data 			= arg( arguments, "buffer" )
				, contentType 	= arg( arguments, "string", null, 1 )
				, private 		= arg( arguments, "boolean", true )
				, headers 		= arg( arguments, "object", {} )
				, callback 		= arg( arguments, "function", function( err ){ if ( err ) throw new err; } );

			if ( !path ) callback( new Error( "missing the argument «path», it must be the first string variable passed to the put method!" ).setName( "MissingArgumentException" ) );
			if ( !data ) callback( new Error( "missing the argument «data», you must pass a variable with the type «buffer» to the put method!" ).setName( "MissingArgumentException" ) );
			if ( !contentType ) callback( new Error( "missing the argument «contentType», it must be the second string variable passed to the put method!" ).setName( "MissingArgumentException" ) );

			// set setome headers
			headers[ "Content-Type" ] = contentType;
			if( !headers.date ) headers.date = new Date().toUTCString();
			if ( !private ) headers[ "x-amz-acl" ] = "public-read";


			var executeRequest = function(url){
				request( {
					  url:  		url || ("https://" + this.credentials.bucket + ".s3.amazonaws.com" + path)
					, method: 		"PUT"
					, aws: 			this.credentials
					, body: 		data
					, timeout: 		600000 // 10 minutes
					, headers: 		headers
				}, function( err, response, body ){
					if ( err ) callback( err );
					else {
						if (response) {
							if (response.statusCode === 200) callback();
							else if (response.statusCode === 307) executeRequest(response.headers.location);
							else callback( new Error( "Upload failed, status: " + response.statusCode ).setName( "UploadFailedException" ) );
						}
						else callback( new Error( "Upload failed, unknown status!").setName( "UploadFailedException" ) );
					}
				}.bind( this ) );
			}.bind(this)

			executeRequest();
		}






		, execute: function( action, origArgs ){
			var callback 	= arg( origArgs, "function", function(){} )
				, args 		= Array.prototype.slice.call( origArgs, 0 );

			this.pool[ action ].get( function( err, resource ){
				if ( err ) callback( err );
				else {
					// we extracted the original callback so we can add our own
					// thats we neded to free the resource afer the upload has finished
					// the freeResource function was added by the resourcepool and isnt 
					// part of the uploader class
					var idx = 0, cb = function(){
						var returnValues = Array.prototype.slice.call( arguments, 0 );

						resource.freeResource();

						callback.apply( null, returnValues );
					}.bind( this );


					// remove original callback from 
					args = args.filter( function( a, index ){ 
						if ( type.function( a ) ){
							idx = index;
							return false;
						}
						else {
							return true;
						}
					} );

					args.splice( idx, 0, cb );

					this[ "_" + action ].apply( this, args );
				}
			}.bind( this ) );
		}



		, initialize: function(){
			[ "get", "put", "delete", "list", 'head' ].forEach( function( action ){
				this.createResourPool( action );
			}.bind( this ) );
		}



		, createResourPool: function( action ){
			var pool = new ResourcePool( {
				  max: 					this.max[ action ] || this.max.generic || this.max.default
				, maxWaitingRequests: 	100000
				, timeout: 				3600000
				, idle: 				60000 
				, prefetch: 			10
			} );

			pool.on( "resourceRequest", function( callback ){ callback( {} ); } );

			this.pool[ action ] = pool;
		}
	} );