var app = angular
	.module('spotBeta', [
		'ngAnimate',
		// 'ngCookies',
		'ngResource',
		'ngRoute',
		// 'ngSanitize',
		// 'ngTouch',
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


app.factory('callFire', function($firebase, FIREBASE_URL){
	var ref = new Firebase(FIREBASE_URL);

});


app.factory('Auth', ["$firebaseAuth", "FIREBASE_URL", "$rootScope", function($firebaseAuth, FIREBASE_URL, $rootScope) {
	var ref = new Firebase(FIREBASE_URL);
	var auth = $firebaseAuth(ref);

	var Auth = {
		register: function(user) {
			return auth.$createUser({email: user.email, password: user.password});
		},
		login: function(user) {
			return auth.$authWithPassword(user);
		},
		logout: function() {
			auth.$unauth();
		},
		resolveUser: function() {
			return auth.$getCurrentUser();
		},
		signedIn: function() {
			return !!Auth.user.provider;
		},
		user: {}
	};

	auth.$onAuth( function(user) {
		if (user) {
			// logged in...
			console.log('logged in');
			angular.copy(user, Auth.user);

			console.log('User:');
			console.log(Auth.user);
		} else {
			// logged out...
			console.log('logged out');
			angular.copy({}, Auth.user);
		}
	});

	// $rootScope.$on('auth.$onAuth', function(e, user) {
	// 	console.log('logged in');
	// 	angular.copy(user, Auth.user);

	// 	console.log('User:');
	// 	console.log(Auth.user);
	// });
	// $rootScope.$on('$firebaseAuth:logout', function(){
	// 	console.log('logged out');
	// 	angular.copy({}, Auth.user);
	// });

	return Auth;
}]);


app.factory('Profile', ["$window", "FIREBASE_URL", "$firebase", function($window, FIREBASE_URL, $firebase){
	var ref = new $window.Firebase(FIREBASE_URL);

	var profile = {
		get: function(userId) {
			return $firebase(ref.child('profile').child(userId)).$asObject();
		}
	}

	return profile;
}]);


app.controller('mainController', ['$scope', '$location', 'Auth', function($scope, $location, Auth){

	// USER AUTHENTICATION
	//TODO: change the paths here from '/' to the dashboard template

	$scope.signedIn = Auth.signedIn;
	$scope.logout = Auth.logout;
	$scope.user = Auth.user;
	$scope.oldUser = {};

	if (Auth.signedIn) {
		$location.path('/');
	}

	$scope.login = function() {
		Auth.login($scope.oldUser).then(function(userData){
			console.log('User Logged In:');
			console.log(userData);

			$location.path('/');
			$scope.hideAuth();
			// $scope.signedIn = Auth.signedIn;

			console.log('User:');
			console.log(Auth.user);
			console.log('$scope.user:');
			console.log($scope.user);

		}, function(error) {
			$scope.error = error.toString();
		});
	}

	$scope.register = function() {
		Auth.register($scope.user).then(function(userData){
			console.log('User Created:');
			console.log(userData);

			return Auth.login($scope.user).then(function(){
				$location.path('/');
			});
		}, function(error) {
			$scope.error = error.toString();
		});
	}


	// Show/Hide Login and Signup forms in menu bar
	$scope.signupShowing = false;
	$scope.loginShowing = false;

	$scope.showLogin = function() {
		$scope.signupShowing = false;
		$scope.loginShowing = !$scope.loginShowing;
	}
	$scope.showSignup = function() {
		$scope.signupShowing = !$scope.signupShowing;
		$scope.loginShowing = false;
	}
	$scope.hideAuth = function() {
		$scope.signupShowing = false;
		$scope.loginShowing = false;
	}


}]);