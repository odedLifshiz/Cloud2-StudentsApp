# ee-project

Loads config.js files in the project roo directory, provides infos about git

## installation

	npm install ee-project

## build status

[![Build Status](https://travis-ci.org/eventEmitter/ee-project.png?branch=master)](https://travis-ci.org/eventEmitter/ee-project)


## usage

### importing

	var project = require('ee-project');

### project.root

returns the projects root path

	log(project.root);

### project.config

returns the contents of the config.sj file in the project root path, if available

	log(project.config);

### project.git.revision()

returns the current revision of HEAD of the git repository found in the project.root directory

	project.git.revision(function(err, revision){
		log(revision); // 324...
	});


### project.git.remote()

returns the remote of the git repository found in the project.root directory

	project.git.remote(function(err, remote){
		log(remote); // git@github.com:eventEmitter/ee-project
	});


### project.git.remoteRepository()

returns the remoteRepository of the git repository found in the project.root directory

	project.git.revision(function(err, remoteRepository){
		log(remoteRepository); // eventEmitter/ee-project
	});