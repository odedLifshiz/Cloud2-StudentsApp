
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, assert 		= require('assert')
		, fs 			= require('fs');




	var project = require('../');


	describe('The Project library', function(){

		it('Should be able to return the project path', function(){
			assert.ok(project.root);
		});

		it('Should be able to return the config.js contents', function(){
			assert.deepEqual(project.config,  {
				  test:   	true
				, passing: 	'test'
			});
		});	

		it('Should be able to return the GIT revision', function(done){
			project.git.revision(done);
		});

		it('Should be able to return the GIT remote', function(done){
			project.git.remote(done);
		});

		it('Should be able to return the GIT remote repository', function(done){
			project.git.remoteRepository(done);
		});
	});
	