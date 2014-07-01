StudentCache = function(cache) {
	this.cache = cache;
};

StudentCache.prototype.findAll = function(callback){
	this.cache.lrange("students", 0, 99, function(err, result){
	    if (err) {
	        callback(err);
	    } else {
	        callback(err, result.map(JSON.parse));
	    }
	});
};

StudentCache.prototype.insert = function(student, callback){
	this.cache.multi([
        ["lpush", "students", JSON.stringify(student)],
        ["ltrim", "students", "0", "49"]
	]).exec(callback);
};

module.exports = StudentCache;
