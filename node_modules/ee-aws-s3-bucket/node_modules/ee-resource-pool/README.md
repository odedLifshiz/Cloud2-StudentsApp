# ee-resource-pool

resource pool for managing shared resources 

## installation

	npm install ee-resource-pool
	
## build status

[![Build Status](https://travis-ci.org/eventEmitter/ee-resource-pool.png?branch=master)](https://travis-ci.org/eventEmitter/ee-resource-pool)


## usage

example of a pool of connections, there may never be more than 50 connections open. 


	var ResourcePool = require( "ee-resource-pool" );


	var pool = new ResourcePool( {
		  max: 50 					// max 50 connections
		, maxWaitingRequests: 1000 	// fail requests for a connection when there are already more then 1'000 requests waiting
		, timeout: 5000 			// fail requests for a connection after waiting 5 seconds
		, idle: 600000 				// close conenctions if they weren't used in the last 10 minutes
		, prefetch: 10 				// create always 10% more connections currently used, so we neevr have to wait for aconnection to be created
	} );


	// the pool can request more resources, but if you don't need 
	// special resources you dont listen for the event and the pool 
	// will create its own resource representation 
	// -> this is entirely optional
	pool.on( "resourceRequest", function( callback ){
		callback( new Connection() );
	} );


	// if the pool gets a free resource which isn't used by the queue it emits the «resource» event
	pool.on( "resource", function(){
		pool.get( function( err, resource ){
			// you should get that exact resource which triggered the event

		} );
	} );


	// this code is placed where you request the connections
	pool.get( function( err, connection ){
		if ( err ){
			if ( err.name === "CapacityOverloadException" ) {
				console.log( "the resource pool is over capacity ...", err );
			}
			else if ( err.name === "RequestTimeoutException" ){
				console.log( "timeout while waiting for a free connection ...", err );
			}
		}
		else {
			// use the connection
			// IMPORTANT: if you are finished using ti you have to call the «freeResource» or «closeResource» method 

			connection.query( "whatever", function( err, data ){
				if ( err ){
					console.log( "crap, my query failed" );
					connection.closeResource();
					connection.close();
				}
				else {
					console.log( "got some data :)" );
					connection.freeResource();
				}
			} );
		}
	} );



example of an image uploader which never should upload more than 5 images at the same time

	var ResourcePool = require( "ee-resource-pool" );


	var pool = new ResourcePool( {
		  timeout: 3600000 			// fail if we cannot upload an image within the next hour
		, ratelLimit: 5 			// max 5 uploads / second
	} );


	// the pool can request more resources
	pool.on( "resourceRequest", function( callback ){
		callback( new Uploader() );
	} );


	// this code is placed where you uploader your imges, it will rate liimit your request...
	pool.get( function( err, uploader ){
		if ( err ){
			if ( err.name === "RequestTimeoutException" ){
				console.log( "timeout while waiting for a free uploader ...", err );
			}
		}
		else {
			// use the uploader
			// IMPORTANT: if you are finished using ti you have to call the «freeResource» or «closeResource» method 

			uploader.upload.query( data, function( err ){
				if ( err ){
					console.log( "crap, the upload failed" );
					uploader.closeResource();
				}
				else {
					console.log( "upload finished :)" );
					uploader.freeResource();
				}
			} );
		}
	} );