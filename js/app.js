var app = angular.module('spotBeta', [
		'ngAnimate',
		// 'ngCookies',
		'ngResource',
		'ngRoute',
		// 'ngSanitize',
		// 'ngTouch',
		'firebase'
	])
	.constant('FIREBASE_URL', 'https://intense-inferno-4354.firebaseio.com' )
	.config(function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'home.html',
				controller: 'homeController'
			})
			.when('/app', {
				templateUrl: 'app.html',
				controller: 'appController'
			})
			.when('/profile', {
				templateUrl: 'app.html',
				controller: 'appController'
			})
			.when('/lists', {
				templateUrl: 'app.html',
				controller: 'appController'
			})
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider.html5Mode(true);
	});