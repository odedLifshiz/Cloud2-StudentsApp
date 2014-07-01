'use strict';

var StudentsController = function ($scope, $http) {
    $scope.student = {};
    $scope.deleteNotification = false;
    $scope.editMode = false;

    $scope.fetchList = function () {
        var index = $scope.filterBy;
        var filter = $scope.filterText;
        if (index == undefined || index == "") {
            $http.get('students').success(function (students) {
                $scope.studentsList = students;
            });
        } else {
            $http.get('students/' + index + '/' + filter).success(function (students) {
                $scope.studentsList = students;
            });
        }
    }

    $scope.addStudent = function (student) {
		var dateObj=new Date();
		var month = dateObj.getUTCMonth();
		var day = dateObj.getUTCDate();
		var year = dateObj.getUTCFullYear();
		var newdate;
		newdate	= day +"/" + month + "/" +year ;
		student.creationDate=newdate;
		
        $scope.resetError();
		
        $http.post('students', student).success(function () {
            $scope.fetchList();
            $scope.resetForm();
        }).error(function () {
                $scope.setError('Could not add.');
            });
    }

    $scope.updateStudent = function (student) {
        $scope.resetError();

        $http.put('students', student).success(function () {
            $scope.fetchList();
            $scope.resetForm();
        }).error(function () {
                $scope.setError('Could not update.');
            });
    }

    $scope.editStudent = function (student) {
        $('#student_photo').val('');
        $scope.resetError();
        $scope.student = student;
        $scope.editMode = true;
    }

    $scope.remove = function (item) {
        $scope.resetError();

        $http.delete('students/' + item.id + "/" + item.creationDate).success(function () {
            $scope.fetchList();
        }).error(function () {
                $scope.setError('Could not remove student');
            });
        $scope.showDeleteNotification(false);
    }

$scope.resetForm = function () {
        $('#student_photo').val('');
        $scope.resetError();
        $scope.student = {};
        $scope.editMode = false;
    }

    $scope.resetError = function () {
        $scope.error = false;
        $scope.errorMessage = '';
    }

    $scope.setError = function (message) {
        $scope.error = true;
        $scope.errorMessage = message;
    }

    $scope.showDeleteNotification = function (show, item) {
        if (show === true) {
            $scope.deleteNotification = true;
        } else {
            $scope.deleteNotification = false;
        }
        $scope.deleteItem = item;
    };

    $scope.fetchList();

    $scope.predicate = 'creationDate';
}