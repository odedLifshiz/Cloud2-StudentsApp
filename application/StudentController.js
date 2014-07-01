function StudentController(app) {
	this.studentService = app.studentService;
};

StudentController.prototype.findAll = function findAll(req, res){
	this.studentService.findAll(function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});
};

StudentController.prototype.findByIndex = function(req, res){
	var index = req.param("index");
	var filter = req.param("filter");
	this.studentService.findByIndex(index, filter, function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});
};

StudentController.prototype.insert = function(req, res){
	var student = req.body;
	if (!validStudent(student)) {
		res.send(400, "Invalid student: " + JSON.stringify(student));
		return;
	};
	this.studentService.insert(student, function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});
};

StudentController.prototype.update = function(req, res){
	var student = req.body;
	if (!validStudent(student)) {
		res.send(400, "Invalid student: " + JSON.stringify(student));
		return;
	};
	this.studentService.update(student, function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});
};

StudentController.prototype.delete = function(req, res){
	console.log("1dfsdfsdf");
	var id = req.param("id");
	var creationDate = req.param("creationDate");
	if (!validId(id)) {
		res.send(400, "Invalid ID: " + id);
		return;
	}
	this.studentService.delete(id, creationDate, function(err, result) {
		
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});
};

module.exports = StudentController;


// helper functions
function validId(id) {
	return id.indexOf(' ') < 0;
}
function validStudent(student) {
	return true; // TODO
}