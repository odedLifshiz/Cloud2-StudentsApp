var createMySQLWrap = require('mysql-wrap');
var S3Bucket        = require('ee-aws-s3-bucket');  
var mime            = require('mime');

StudentDao = function(config, connection) {
	this.connection = createMySQLWrap(connection);
	this.photosBucket = new S3Bucket({
		key: config.awsCredentials.key,
		secret: config.awsCredentials.secret,
		bucket: config.awsS3Bucket
	});
	this.tableName = config.mysql.table;
	this.awsS3Url = config.awsS3Url + config.awsS3Bucket;
	this.awsCloudFrontUrl = config.awsCloudFrontUrl;
};

StudentDao.prototype.findAll = function(callback){
	this.connection.select(this.tableName, {}, function(err, result) {
		callback(err, result);
	});
	 
};

StudentDao.prototype.findByIndex = function(index, filter, callback){
	results=[];
	queryToRun='SELECT * FROM '+this.tableName +' WHERE +'+index+'='+'\''+filter+'\'';
	console.log(queryToRun);
    this.connection.query(queryToRun, [results], function(err, result)
    {
		console.log(result);
		callback(err, result);
    });
};



StudentDao.prototype.insert = function(student, callback){
	var me = this;
	var uuid = guid();
	student.id = uuid;
	extension=mime.extension(student.photo.definition.type);
	fullNameOfImage=uuid + "." + extension;
	var photoPath = "/photos/" + fullNameOfImage;
	this.photosBucket.put(photoPath, new Buffer(student.photo.content.substring(student.photo.content.indexOf(',') + 1), "base64"), student.photo.definition.type, function(err) {
		if (err) {
			callback(err);
			return;
		}
		student.photo = me.awsCloudFrontUrl + photoPath;
		me.connection.insert(me.tableName, student, function(result, err) {
			callback(result, err);
		});
	}, undefined, false); 
	
};

StudentDao.prototype.update = function(student, callback){

	this.connection.update(this.tableName, student, {'id': student.id}, function(result, err) {
		callback(result, err);
	});

};

StudentDao.prototype.delete = function(id, creationDate, callback){
	console.log(id);
	console.log("sdfdsf");
	this.connection.delete(this.tableName, {'id': id}, function(result, err) {
		callback(result, err);
	});
};

module.exports = StudentDao;


// helper functions
// from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();