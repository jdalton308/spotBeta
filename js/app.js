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


app.factory('ClimbData', ["FIREBASE_URL", "$firebaseObject", 
	function(FIREBASE_URL, $firebaseObject){

	// Get data
	var ref = new Firebase(FIREBASE_URL);
	var data = $firebaseObject(ref);

	// var climbData = {
	// 	loaded: function() {
	// 		// Returns promise for when data is loaded. Use with a .then().catch();
	// 		return data.$loaded();
	// 	}
	// }

	return data;
}]);


app.controller('mainController', ['$scope', '$location', 'Auth', 
	function($scope, $location, Auth){

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


app.controller('appController', ['$scope', "FIREBASE_URL", 'Auth', 'ClimbData', 
	function($scope, FIREBASE_URL, Auth, ClimbData){

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


	// Location data
	$scope.searchResult = {
		name: 'Berkeley',
		lat: 37.8717,
		lng: -122.2728
	}

}]);


app.directive('jdMapFilter', ['ClimbData', function(ClimbData){
	return {
		restrict: 'E',
		templateUrl: "directives/mapFilter.html",
		link: function(scope, element, attributes) {

			// Render data after loaded
			ClimbData.$loaded()
				.then(function(data){
					// console.log('Data in directive');
					// console.log(data);

					drawMarkers(data.data);
				})
				.catch(function(err){
					console.error(err);	
				});


			// Draw map
			var currentLat = 37.8717;
			var currentLong = -122.2728;

			var mapElement = document.getElementById("googleMap");

			var mapOptions = {
				center: new google.maps.LatLng(currentLat, currentLong),
				zoom: 12,
				mapTypeId: google.maps.MapTypeId.TERRAIN
			};

			var map = new google.maps.Map(mapElement, mapOptions);


			// Markers
			var drawMarkers = function(data) {

				angular.forEach( data, function(val, key){

					var spotTitle = val.name;
					var thisLong = val.location.long;
					var thisLat = val.location.lat;
				

					// Create new marker for each location
					scope['marker' + key] = new google.maps.Marker({
					// var marker = new google.maps.Marker({
						title: spotTitle,
						position: new google.maps.LatLng(thisLat, thisLong),
						map: map
					});


					// Create info box for each marker
					var boxContent =
						'<div class="mapInfoBox">' +
								'<h2>' + spotTitle + '</h2>';

					// for each route, construct the HTML
					for (var i = 0; i < val.climbs.length; i++) {
						var thisRoute = val.climbs[i];

						var routeTitle = thisRoute.name;
						var grade;

						if (thisRoute.type = 'boulder') {
							grade = "V" + thisRoute.rating;
						} else {
							grade = "5." + thisRoute.rating;
						}

						var routeElement = 
							'<div class="boxRoute">' +
								'<span class="boxRating">' + grade + '</span>' +
								'<a href="#">' + routeTitle + '</a>' +
							'</div>';

						boxContent += routeElement;
					}

					boxContent += '</div>';

					scope['infoBox' + key] = new google.maps.InfoWindow({
						content: boxContent
					});


					// Marker click event
					google.maps.event.addListener(scope['marker' + key], 'click', function(){
						scope['infoBox' + key] .open(map, scope['marker' + key] );
						map.panTo( scope['marker' + key].getPosition() );
					});

				});
			};


			// Info Windows
//TODO: create single template, then set scope to be whatever marker was clicked
			// var boxContent = 
			// 	'<div class="mapInfoBox">' +
			// 		'<h2>Routes</h2>' +
			// 		'<div class="boxRoute">' +
			// 			'<a href="#">Indian Traverse</a>' +
			// 			'<span class="boxRating">V5</span>' +
			// 		'</div>' +
			// 		'<div class="boxRoute">' +
			// 			'<a href="#">Waterfall</a>' +
			// 			'<span class="boxRating">V1</span>' +
			// 		'</div>' +
			// 	'</div>';

			// var infoBox = new google.maps.InfoWindow({
			// 	content: boxContent
			// });


			// // Marker click event
			// google.maps.event.addListener(marker, 'click', function(){
			// 	infoBox.open(map, marker);
			// 	map.setCenter(marker.getPosition());
			// });


			// // Close info boxes on map click
			// google.maps.event.addListener(map, 'click', function(){
			// 	infoBox.close();
			// 	infoBox2.close();
			// });
		}
	}
}]);