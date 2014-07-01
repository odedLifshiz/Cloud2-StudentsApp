# ee-ttl-queue

Queue with timeout function

## installation

	npm install ee-ttl-queue


## build status

[![Build Status](https://travis-ci.org/eventEmitter/ee-ttl-queue.png?branch=master)](https://travis-ci.org/eventEmitter/ee-ttl-queue)

## usage

	var Queue = require( "ee-ttl-queue" )
		. log = require( "ee-log" );


	// create a queue wich cannot hold more than 9 items at the time
	// the items added to the queue will timeout if they are not 
	// retreived via the .get() api.
	// the timeout event will emit the items which are timed out.
	// the error event will be invoked if the queue is overflowing, 
	// which is in this case when the 10th item is added.

	var q = new Queue( { 
		  ttl: 1000
		, max: 9 
		, on: {
			timeout: function( item ){ log( item ); }
			, error: function( err, item ){ log( err ); }
		}
	} );


	// you may queue any type of variable, return true when the item was queued
	var itemWasAdded = q.queue( whatever );

	// alternative syntax
	var itemWasAdded = q.add( whatever );

	// you may remove items again
	q.remove( whatever );

	// retreive the oldest item
	var item = q.get();

