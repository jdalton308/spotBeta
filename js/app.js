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

	return data;
}]);


app.controller('homeController', ['$scope', '$location', 'Auth', 
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

			// RENDERING
			//====================

			// Draw map
			var currentLat = 37.8717;
			var currentLong = -122.2728;

			var mapElement = document.getElementById("googleMap");
			var mapOptions = {
				center: new google.maps.LatLng(currentLat, currentLong),
				zoom: 12,
				mapTypeId: google.maps.MapTypeId.TERRAIN
			};

			scope.map = new google.maps.Map(mapElement, mapOptions);

			if (scope.markers === undefined) {
				scope.markers = {};
			}

			var infoWindow = new google.maps.InfoWindow();


			// Markers/Marker click events function
			var drawMarkers = function(data) {

				angular.forEach( data, function(val, key){
					// Loop through each climb spot

					var spotTitle = val.name;
					var thisLong = val.location.long;
					var thisLat = val.location.lat;


					// Hide each marker by default, then show if route included
					val.included = false;

					// Create info box for each marker
					var boxContent =
						'<div class="mapInfoBox">' +
								'<h2>' + spotTitle + '</h2>';

					// for each route, construct the HTML within infobox
					angular.forEach( val.climbs, function(climb, key){

						// Initial rendering creates the included var for filtering
						if (climb.included === undefined) {
							climb.included = true;
						}

						// Test if climb should be included
						if (climb.included) {

							// show spot's marker, since at least one climb is shown
							val.included = true;

							var routeTitle = climb.name;
							var grade;

							if (climb.type = 'boulder') {
								grade = "V" + climb.rating;
							} else {
								grade = "5." + climb.rating;
							}

							var routeElement = 
								'<div class="boxRoute">' +
									'<span class="boxRating">' + grade + '</span>' +
									'<a href="#">' + routeTitle + '</a>' +
								'</div>';

							boxContent += routeElement;
						}
					});

					boxContent += '</div>';
				

					// If included routes, create new marker for each location
					if (val.included) {
						console.log('Spot included');

						if (scope.markers[key]) {
							console.log('Marker exists');
							// marker exists, so just update info box
							scope.markers[key].boxContent = boxContent;

						} else {
							console.log('Creating new marker');
							// create a new marker
							
							// scope['marker' + key] = new google.maps.Marker({
							var marker = new google.maps.Marker({
								title: spotTitle,
								position: new google.maps.LatLng(thisLat, thisLong),
								map: scope.map
							});

							// Marker click event
							google.maps.event.addListener(marker, 'click', function(){
								// scope['infoBox' + key].open(map, scope['marker' + key] );
					            infoWindow.setContent(marker.boxContent);
					            infoWindow.open(scope.map, marker);
								scope.map.panTo( marker.getPosition() );
							});

							scope.markers[key] = marker;
						}

					} else {
						// Destroy the marker, infobox, and click-event listner
						console.log('Deleting...')
						console.log(scope.markers[key]);

						scope.markers[key].setMap(null);
						// scope['marker' + key].setVisible(null);
						// setTimeout(function(){
						// 	scope['marker' + key] = null;
						// }, 1);
						//google.maps.event.clearListeners(scope['marker' + key], 'click');

						scope.markers[key] = null;
						// delete scope['marker' + key];
						// console.log('Spot removed');
						// console.log('Scope:');
						// console.log(scope);

					}

				}); // end forEach()
			}; // end drawMarkers()


			// Render markers after data loaded
			var originalData;
			var filteredData;

			ClimbData.$loaded()
				.then(function(data){
					console.log('Data in directive');
					console.log(data);

					originalData = angular.copy(data.data);
					filteredData = angular.copy(data.data);

					drawMarkers(filteredData);
				})
				.catch(function(err){
					console.error(err);	
				});



			// FILTERING
			//==================

			// Filter the markers on clicks
			scope.filter;

			scope.filterType = function(type) {

				console.log(scope.filter);

				angular.forEach(filteredData, function(value, key){
					// loop through each climbing spot 
					var spotClimbs = value.climbs;

					angular.forEach(spotClimbs, function(climb, key){
						// loop through each climb

						if (climb.type == type) {
							// identify the climbs that will be filtered, then set to bool, kept track in checkbox
							climb.included = scope.filter[type];
						}
					});
				});

				drawMarkers(filteredData);
				console.log(filteredData);
				console.log(scope);
			}

		}
	}
}]);