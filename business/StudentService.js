StudentService = function(app) {
	this.studentDao = app.studentDao;
	//this.studentCache = app.studentCache;
};
 
StudentService.prototype.findAll = function(callback) {
	//this.studentCache.findAll(function(err, result) {
	//	callback(err, result);
	this.studentDao.findAll(function(err, result) {
		callback(err, result);
	});
	
};

StudentService.prototype.findByIndex = function(index, filter, callback) {
	this.studentDao.findByIndex(index, filter, function(err, result) {
		callback(err, result);
	});
};

StudentService.prototype.insert = function(student, callback) {
	var me = this;
	this.studentDao.insert(student, function(err, result) {
	    if (err) {
	        callback(err);
	    } else {
	       // me.studentCache.insert(student, callback);
	    }
	});
};

StudentService.prototype.update = function(student, callback) {
	this.studentDao.update(student, function(err, result) {
		callback(err, result);
	});
};

StudentService.prototype.delete = function(id, creationDate, callback) {
	console.log("here");
	this.studentDao.delete(id, creationDate, function(err, result) {
		callback(err, result);
	});
};
 
module.exports = StudentService;