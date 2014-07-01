
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, assert 		= require('assert');



	var   ResourcePool = require('../')
		, pool;


	var Resource = new Class({});


	describe('The ResourcePool', function(){
		it('should not throw wenn instantiated', function(){
			pool = new ResourcePool({  
				  maxWaitingRequests 	: 10000
				, timeout 				: 3600000
				, rateLimit 			: 5
			});
		});

		it('should emit the resourceRequest event', function(){
			pool.on('resourceRequest', function(callback){
				callback(new Resource());
			});
		});

		it('should return resources when requeested', function(done){
			pool.get(function(err, resource){
				if (err) done(err);
				else {
					setTimeout(function(){
						resource.freeResource();
						done();
					}, 300);
				}
			});
		});

		it('should not finish too fast when rate limited', function(done){
			this.timeout(25000);

			var   i = jobs 		= 50
				, completed 	= 0
				, started  		= Date.now();

			while(i--) {
				pool.get(function(err, resource){
					resource.freeResource();
					if (++completed === jobs) {
						assert((Date.now()-started) > 9000);
						done();
					}
				});
			}
		});
	});
	