var app = angular
	.module('spotBeta', [
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ngTouch',
		'firebase'
	])
	.constant('FIREBASE_URL', 'https://intense-inferno-4354.firebaseio.com' )
	.config(function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'index.html',
				controller: 'mainController'
			})
			.otherwise({
				redirectTo: '/'
			});
	});

app.controller('mainController', ['$scope', '$location', 'Auth', function($scope, $location, Auth){

	// USER AUTHENTICATION
	//TODO: change the paths here from '/' to the dashboard template

	if (Auth.signedIn) {
		$location.path('/');
	}

	$scope.login = function() {
		Auth.login($scope.user).then(function(){
			$location.path('/');
		});
	}

	$scope.register = function() {
		Auth.register($scope.user).then(function(){
			return Auth.login($scope.user).then(function(){
				$location.path('/');
			});
		});
	}

	$scope.signedIn = Auth.signedIn;
	$scope.logout = Auth.logout;
}]);

app.factory('callFire', function($firebase, FIREBASE_URL){
	var ref = new Firebase(FIREBASE_URL);

});

app.factory('Auth', function($firebaseSimpleLogin, FIREBASE_URL, $rootScope) {
	var ref = new Firebase(FIREBASE_URL);
	var auth = $firebaseSimpleLogin(ref);

	var Auth = {
		register: function(user) {
			return auth.$createUser(user.email, user.password);
		},
		login: function(user) {
			return auth.$login('password', user);
		},
		logout: function() {
			auth.$logout();
		},
		resolveUser: function() {
			return auth.$getCurrentUser();
		},
		signedIn: function() {
			return !!Auth.user.provider;
		},
		user: {}
	};

	$rootScope.$on('$firebaseSimpleLogin:login', function(e, user) {
		console.log('logged in');
		angular.copy(user, Auth.user);
	});
	$rootScope.$on('$firebaseSimpleLogin:logout', function(){
		console.log('logged out');
		angular.copy({}, Auth.user);
	})
})