!function(){

	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, fs 			= require('fs')
		, Git 			= require('./Git');



	module.exports = new Class({

		// path to project root dir
		  root: ''

		// config.js in project.root dir
		, _config: {}



		/**
		 * class constructor
		 */
		, init: function(options) {
			this.evaluateProjectRootPath();
			this.loadConfig();

			this.git = new Git({ path: this.root });
		}





		
		/**
		 * the loadConfig() method load the config.js file oacted in the 
		 * projeect root dir
		 */
		, loadConfig: function() {
			var path = this.root+'config.js';

			if (fs.existsSync(path)){
				try {
					this._config = require(path);
				} catch(err) {
					console.log('Failed to load config.js: '+err);
					process.nextTick(function(){
						log.trace(err);
					});
				};
			}
		}


		/**
		 * the get() getter returns the project config object
		 */
		, get config(){
			return this._config;
		}


		/**
		 * the evaluateProjectRootPath() method tries to find the
		 *  projects root path
		 */
		, evaluateProjectRootPath: function() {
			var   file = process.argv[1]
				, stats;

			if(file && file.indexOf('node_modules') >= 0) file = file.substr(0, file.indexOf('node_modules'));

			stats = fs.statSync(file);


			if(stats){
				if (stats.isDirectory()){
					this.root = file+'/';
				}
				else {
					this.root = file.substr(0, file.lastIndexOf('/')+1);
				}
			}
			else {
				log.warn('Failed to evaluate project root dir!');
			}
		}
	});
}();
