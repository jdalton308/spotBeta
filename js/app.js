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
				controller: 'mainController'
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


app.factory('callFire', function($firebase, FIREBASE_URL){
	var ref = new Firebase(FIREBASE_URL);

});


app.factory('Auth', ["$firebaseAuth", "FIREBASE_URL", "$rootScope", function($firebaseAuth, FIREBASE_URL, $rootScope) {
	var ref = new Firebase(FIREBASE_URL);
	var auth = $firebaseAuth(ref);

	var Auth = {
		register: function(user) {
			return auth.$createUser(user);
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

	$scope.signedIn = Auth.signedIn;
	$scope.logout = Auth.logout;
	$scope.user = Auth.user;
	$scope.oldUser = {};

	// if (Auth.signedIn) {
	// 	$location.path('/');
	// }

	$scope.login = function() {
		Auth.login($scope.oldUser).then(function(userData){
			console.log('User Logged In:');
			console.log(userData);

			$location.path('/app');
			$scope.hideAuth();

		}, function(error) {
			$scope.error = error.toString();
		});
	}

	$scope.register = function() {
		Auth.register($scope.user).then(function(userData){
			console.log('User Created:');
			console.log(userData);

			return Auth.login($scope.user).then(function(){
				$location.path('/app');
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


app.controller('appController', ['$scope', 'Auth', function($scope, Auth){
	$scope.signedIn = Auth.signedIn;
	$scope.logout = Auth.logout;
	$scope.user = Auth.user;
	$scope.oldUser = {};

	$scope.login = function() {
		Auth.login($scope.oldUser).then(function(userData){
			console.log('User Logged In:');
			console.log(userData);

			$location.path('/app');
			$scope.hideAuth();

		}, function(error) {
			$scope.error = error.toString();
		});
	}

	$scope.register = function() {
		Auth.register($scope.user).then(function(userData){
			console.log('User Created:');
			console.log(userData);

			return Auth.login($scope.user).then(function(){
				$location.path('/app');
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

app.directive('jdGoogleMap', function(){
	return {
		restrict: 'E',
		template: "<div class='googleMap'></div>",
		link: function(scope, element, attributes) {

			var berkeleyLat = 37.8717;
			var berkeleyLong = -122.2728;

			var mapElement = element[0];

			var mapOptions = {
				center: new google.maps.LatLng(berkeleyLat, berkeleyLong),
				zoom: 10
			};
			var map = new google.maps.Map(mapElement, mapOptions);
		}
	}
});