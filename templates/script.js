var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider) {
	$routeProvider

	.when('/', {
		templateUrl  : 'pages/home.html',
		controller   : 'mainController'
	})

	.when('/about', {
		templateUrl  : 'pages/about.html',
		controller   : 'aboutController'
	})

	.when('/login', {
		templateUrl  : 'pages/login.html',
		controller   : 'loginController'
	});
});

app.controller('mainController', function($scope) {

});

app.controller('aboutController', function($scope) {

});

app.controller('loginController', function($scope) {

});