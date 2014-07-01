'use strict';

var Cloud02App = {};

var App = angular.module('Cloud02App', ['Cloud02App.filters', 'Cloud02App.services', 'Cloud02App.directives']);

App.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'layout.html',
        controller: StudentsController
    });
    $routeProvider.otherwise({redirectTo: '/'});
}]);
