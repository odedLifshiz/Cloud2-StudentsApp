var S3Bucket        = require('ee-aws-s3-bucket');
var mime            = require('mime');
var converter       = require('dynamo-converters');

StudentDao = function(config, connection) {
	this.connection = connection;
	this.photosBucket = new S3Bucket({
		key: config.awsCredentials.key,
		secret: config.awsCredentials.secret,
		bucket: config.awsS3Bucket
	});
	this.awsS3Url = config.awsS3Url;
	
	// helper methods
	var me = this;
	this.uploadStudentPhoto = function(student, callback) {
		if (student.photo == undefined || student.photo.content == undefined) {
			callback(null);
			return;
		};
		var photoPath = "/photos/" + student.id + "." + mime.extension(student.photo.definition.type);
		this.photosBucket.put(photoPath, new Buffer(student.photo.content.substring(student.photo.content.indexOf(',') + 1), "base64"), student.photo.definition.type, function(err) {
			if (err) {
				callback(err);
				return;
			}
			student.photo = me.awsS3Url + photoPath;
			callback(err);
		}, undefined, false); // last argument indicates if it's private
	}
};

StudentDao.prototype.findAll = function(callback){
	this.connection.scan({'TableName': 'students', 'Limit': 10}, function (err, result) {
	    if (err) {
	        callback(err);
	    } else {
	        var students = result.Items.map(converter.itemToData);
		    callback(err, students);
	    }
	});
};

StudentDao.prototype.findByIndex = function(index, filter, callback){
    var params = {
        KeyConditions: {},
        IndexName: index + "-index",
        Limit: 10,
        TableName: 'students',
    };
    params.KeyConditions[index] = {};
    params.KeyConditions[index].ComparisonOperator = 'EQ';
    params.KeyConditions[index].AttributeValueList = [{'S': filter}];
	this.connection.query(params, function (err, result) {
	    if (err) {
	        callback(err);
	    } else {
	        var students = result.Items.map(converter.itemToData);
		    callback(err, students);
	    }
	});
};

StudentDao.prototype.insert = function(student, callback){
	var me = this;
	var uuid = guid();
	student.id = uuid;
	student.creationDate = new Date().toISOString();
	this.uploadStudentPhoto(student, function(err) {
        me.connection.putItem({'TableName': 'students', 'Item': converter.dataToItem(student)}, function(err, result) {
            callback(err, result);
        });
	});
};

StudentDao.prototype.update = function(student, callback){
	var me = this;
	this.uploadStudentPhoto(student, function(err) {
        me.connection.putItem({'TableName': 'students', 'Item': converter.dataToItem(student)}, function(err, result) {
            callback(err, result);
        });
	});
};

StudentDao.prototype.delete = function(id, creationDate, callback){
    this.connection.deleteItem({'TableName': 'students', 'Key': {'id': {'S': id}, 'creationDate': {'S': creationDate}}}, function(err, result) {
        callback(err, result);
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