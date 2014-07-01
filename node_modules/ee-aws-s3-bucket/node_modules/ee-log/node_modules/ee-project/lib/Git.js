!function(){

	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, fs 			= require('fs')
		, cp 			= require('child_process');



	module.exports = new Class({

		/**
		 * class constructor
		 */
		init: function(options) {
			this.path = options.path;
		}



		/**
		 * the revision() method returns the revision of the HEAD
		 * in the current project root
		 *
		 * @param <Function> callback(err, revision);
		 */
		, revision: function(callback){
			if (this._revision) callback(null, this._revision);
			else {
				cp.exec('cd '+this.path+' && git rev-parse HEAD', function(err, stdout, stderr){
					if (err) callback( err );
					else if (!stdout || stdout.trim().length < 10) callback(new Error('failed to load git reveision!'));
					else {
						this._revision = stdout.trim();
						callback (null, this._revision);
					}
				}.bind( this ));
			}
		}



		/**
		 * the remote() method returns the remote of the local repository
		 *
		 * @param <Function> callback(err, remote);
		 */
		, remote: function(callback){
			if (this._remote) callback(null, this._remote);
			else {
				cp.exec('cd '+this.path+' && git config --get remote.origin.url', function(err, stdout, stderr){
					if (err) callback( err );
					else if (!stdout || stdout.trim().length < 10) callback(new Error('failed to load git remote!'));
					else {
						this._remote = stdout.trim();
						callback (null, this._remote);
					}
				}.bind( this ));
			}	
		}



		/**
		 * the remoteRepository() method returns the remote repository name
		 *
		 * @param <Function> callback(err, remoteRepository);
		 */
		, remoteRepository: function(callback){
			if (this._remoteRepository) callback(null, this._remoteRepository);
			else {
				this.remote(function(err, remote){
					if(err) callback(err);
					else {
						this._remoteRepository = remote.substring(remote.lastIndexOf(':')+1, (remote.lastIndexOf('.git') > 0 ? remote.lastIndexOf('.git') : remote.length));
						callback(null, this._remoteRepository);
					}
				}.bind(this));
			}
		}
	});
}();
