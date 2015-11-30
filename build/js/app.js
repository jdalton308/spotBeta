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
				controller: 'appController'
			})
			.when('/app', {
				templateUrl: 'app.html',
				controller: 'appController'
			})
			.otherwise({
				redirectTo: '/'
			});

		// $locationProvider.html5Mode(true);
	});



app.controller('appController', ['$scope', '$location', '$timeout', "FIREBASE_URL", 'Auth', 'ClimbData', 'User', 'Places',
	function($scope, $location, $timeout, FIREBASE_URL, Auth, ClimbData, User, Places){


	// User creation and authentication
	//==============================

	$scope.signedIn = Auth.signedIn;
	$scope.logout = Auth.logout;
	$scope.user = Auth.user;
	$scope.oldUser = {};

	$scope.login = function() {
		Auth.login($scope.oldUser).then(function(profileData){

			console.log('Profile recieved:');
			console.log(profileData);

			$location.path('/app');
			$scope.hideAuth();

		}, function(error) {
			$scope.error = error.toString();
		});
	};

	$scope.register = function() {
		Auth.register($scope.user).then(function(userData){
			console.log('User Created:');
			console.log(userData);


			// Create user profile in database
			// newUser = {};
			// newUser.uid = userData.uid;
			// newUser.info = {
			// 	email: userData.password.email
			// };
			// newUser.lists = {};

			// User.add(newUser).then(
			// 	function(response){
			// 		console.log('User profile created');
			// 		console.log(response);
			// 	},
			// 	function(err){
			// 		console.error('Error creating user profile: '+ err);
			// 	}
			// );


			Auth.login($scope.user).then(function(){
				$location.path('/app');
			});
		}, function(error) {
			$scope.error = error.toString();
		});
	};

	// Climb Uploads
	//=============================
	$scope.showUpload = false;
	$scope.toggleUpload = function() {
		$scope.showUpload = !$scope.showUpload;
	};


	// User Profile
	//================================

	// $scope.userProfile = User.user;



	// Show/Hide Login and Signup forms in menu bar
	//======================================
	$scope.signupShowing = false;
	$scope.loginShowing = false;

	$scope.showLogin = function() {
		$scope.signupShowing = false;
		$scope.loginShowing = !$scope.loginShowing;
	};
	$scope.showSignup = function() {
		$scope.signupShowing = !$scope.signupShowing;
		$scope.loginShowing = false;
	};
	$scope.hideAuth = function() {
		$scope.signupShowing = false;
		$scope.loginShowing = false;
	};

	// Other views
	$scope.showProfile = false;
	$scope.showLists = false;

	$scope.toggleProfile = function(){
		$scope.showProfile = !$scope.showProfile;
		$scope.showLists = false;
	};
	$scope.toggleLists = function() {
		$scope.showLists = !$scope.showLists;
		$scope.showProfile = false;
	};



	// LOCATION SEARCHING
	//===============================

	$scope.currentSearch = Places.currentSearch;

	$scope.predictions = false;

	$scope.latSearch = false;
	$scope.latInvalid = true;
	$scope.searchType = 'placeSearch'; //initialize the options
	$scope.setSearchType = function(searchType) {
		if (searchType == 'placeSearch') {
			$scope.latSearch = false;
		} else if (searchType == 'latSearch') {
			$scope.latSearch = true;
		} else if (searchType == 'currentSearch') {
			$scope.useCurrentLocation();
		}
	}

	var getGeocode = function(query) {
		Places.geocode(query)
			.then(function(results){
				console.log('Place details recieved:');
				console.log(results);

				Places.currentSearch = results[0]; //results is an array

				var lat = Places.currentSearch.geometry.location.A; //37
				var lng = Places.currentSearch.geometry.location.F; //122

				$location.path('/app').search({latitude: lat, longitude: lng});

			}, function(error) {
				console.error(error);
				Places.currentSearch = false;
			});
	}

	// USER GEOLOCATION
	//-----------------
	if (Places.userLocation) {
		$scope.canUseLocation = true;
	} else {
		Places.setUserLocation()
			.then(function(){
				$scope.canUseLocation = true;
			}, function(){
				$scope.canUseLocation = false;
			});
	}

	$scope.useCurrentLocation = function() {
		getGeocode(Places.userLocation);
	}

	// SEARCH BY PLACE or LAT/LNG
	//----------------------------
	$scope.inputKeyup = function(query) {
		if ($scope.latSearch) {
			// perform validation on lat,lng

			var latLng = [];
			var numbers = query.split(',');

			// check if two numbers
			if (numbers.length != 2) {
				// console.error('Please enter two numbers seperated by a comma for searching by latitude and longitude');
				$scope.errorMessage = "Please enter two numbers seperated by a comma for searching by latitude and longitude";
				$scope.latInvalid = true;
				return
			}

			// check if strings are numbers
			for (var i = 0; i < numbers.length; i++) {
				var number = numbers[i].trim();
				var thisFloat = parseFloat(number);

				if (isNaN(thisFloat)) {
					// console.error('Please enter only numbers for latitude and longitude search');
					$scope.errorMessage = "Please enter only numbers for latitude and longitude search";
					$scope.latInvalid = true;
					return;
				} else {
					latLng.push(thisFloat);
				}
			}

			// Since made it to the end, input is valid. Set the view appropriately
			$scope.errorMessage = false;
			$scope.latInvalid = false;
			$scope.latLgnQuery = latLng;

		} else {
			Places.autocomplete(query)
				.then(function(predictions){
					// console.log('Autocomplete returned:');
					// console.log(predictions);

					$scope.predictions = predictions;

				}, function(err){
					console.error(err);
					$scope.predictions = false;
				});
		}
	};

	$scope.showMap = function(input) {

		var query;

		if ($scope.latSearch) {
			// use lat/lng
			var lat = $scope.latLgnQuery[0];
			var lng = $scope.latLgnQuery[1];
			query = new google.maps.LatLng(lat, lng);
		} else {
			// use autocomplete object
			query = input.description;
		}
		// console.log('Query: ');
		// console.log(query);

		getGeocode(query);
	};


}]);




















// USING APPCONTROLLER INSTEAD

// app.controller('homeController', ['$scope', '$location', 'Auth', 'User', 
// 	function($scope, $location, Auth, User){

// 	// USER AUTHENTICATION

// 	$scope.signedIn = Auth.signedIn;
// 	$scope.logout = Auth.logout;
// 	$scope.user = Auth.user;
// 	$scope.oldUser = {};

// 	// if (Auth.signedIn) {
// 	// 	$location.path('/');
// 	// }

// 	$scope.login = function() {
// 		Auth.login($scope.oldUser).then(function(profileData){
// 			console.log('User Logged In:');
// 			console.log(profileData);

// 			$location.path('/app');
// 			$scope.hideAuth();

// 		}, function(error) {
// 			$scope.error = error.toString();
// 		});
// 	}

// 	$scope.register = function() {
// 		Auth.register($scope.user).then(function(userData){
// 			console.log('User Created:');
// 			console.log(userData);

// 			Auth.login($scope.user).then(function(){
// 				$location.path('/app');
// 			});
			
// 		}, function(error) {
// 			$scope.error = error.toString();
// 		});
// 	}


// 	// Show/Hide Login and Signup forms in menu bar
// 	$scope.signupShowing = false;
// 	$scope.loginShowing = false;

// 	$scope.showLogin = function() {
// 		$scope.signupShowing = false;
// 		$scope.loginShowing = !$scope.loginShowing;
// 	}
// 	$scope.showSignup = function() {
// 		$scope.signupShowing = !$scope.signupShowing;
// 		$scope.loginShowing = false;
// 	}
// 	$scope.hideAuth = function() {
// 		$scope.signupShowing = false;
// 		$scope.loginShowing = false;
// 	}


// }]);

app.directive('jdListView', ['User', function(User){
	return {
		restrict: 'E',
		templateUrl: "/js/directives/listView.html",
		link: function(scope, element, attributes) {

			scope.userProfile = User.user();

			

		}
	};
}]);

app.directive('jdMapFilter', ['ClimbData', 'Places', 'User', '$compile', '$routeParams', function(ClimbData, Places, User, $compile, $routeParams){
	return {
		restrict: 'E',
		templateUrl: "js/directives/mapFilter.html",
		controller : function($scope) {

			var controller = this;

			// RENDERING
			//=====================

			// if ($routeParams) {
			// 	console.log('Route Params:');
			// 	console.log($routeParams);
			// }

			// Draw map
			if (Places.currentSearch) {
				// Check for search results
				var currentLat = Places.currentSearch.geometry.location.A;
				var currentLong = Places.currentSearch.geometry.location.F;

			} else if ($routeParams.latitude) {
				// User navicated directly to page
				var currentLat = $routeParams.latitude;
				var currentLong = $routeParams.longitude;

				// get full geolocation object
				var query = new google.maps.LatLng(currentLat, currentLong);

				Places.geocode(query).then(
					function(results){
						// console.log('Place details recieved:');
						// console.log(results);

						Places.currentSearch = results[0]; //results is an array

					}, function(error) {
						console.error(error);
						Places.currentSearch = false;
					}
				);

			} else {
				// Default location = Berkely, cA
				var currentLat = 37.8717;
				var currentLong = -122.2728;
			}

			var mapElement = document.getElementById("googleMap");
			var mapOptions = {
				center: new google.maps.LatLng(currentLat, currentLong),
				zoom: 12,
				mapTypeId: google.maps.MapTypeId.TERRAIN
			};

			$scope.map = new google.maps.Map(mapElement, mapOptions);

			if ($scope.markers === undefined) {
				$scope.markers = {};
			}


			// Get map bounds for filtering
			$scope.mapBounds;

			google.maps.event.addListener($scope.map, 'bounds_changed', function() {
				$scope.mapBounds = $scope.map.getBounds();
			});


			// Info Window
			var infoWindow = new google.maps.InfoWindow();

			google.maps.event.addListener(infoWindow, 'closeclick', function(){
				infoWindow.isOpen = false;
			});


			// UTILITY FUNCTIONS
			//========================

			// Markers/Marker click events function. A BIG FUNCTION.
			// This is also where the data is filtered for included climbs
			this.drawMarkers = function(data) {

				// 1) Determine what is included and create HTML for infobox
				//---------------------------
				angular.forEach( data, function(spot, key){
					// Loop through each climb spot

					var spotTitle = spot.name;
					var thisLong = spot.location.long;
					var thisLat = spot.location.lat;

					// Show spot if within map's bounds
					if ( ($scope.mapBounds.qa.A >= thisLong && thisLong >= $scope.mapBounds.qa.j) &&
						 ($scope.mapBounds.za.A <= thisLat && thisLat <= $scope.mapBounds.za.j) ) {

						// spot is not included until a climb is included
						spot.included = false;
						// console.log(spot.name +' is within bounds');

						// insert html creation for infobox
						// Create info box for each marker
						var rawBoxContent =
							'<div class="mapInfoBox">' +
									'<h2>' + spotTitle + '</h2>';

						// for each route, construct the HTML within infobox
						angular.forEach( spot.climbs, function(climb, key){

							// Initial rendering creates the included var for filtering
							if (climb.included === undefined) {
								climb.included = true;
							}

							// Test if climb should be included
							if (climb.included) {

								// show spot's marker, since at least one climb is shown
								spot.included = true;

								var grade;

								if (climb.type = 'boulder') {
									grade = "V" + climb.grade;
								} else {
									grade = "5." + climb.grade.grade;
								}

								//TODO: FIX THE RATING FOR ROPED CLIMBS

								var routeElement =
									'<div class="boxRoute">' +
										'<span class="boxRating">' + grade + '</span>' +
										'<a href="#" ng-click="viewResultsList()">' + climb.name + '</a>' +
									'</div>';

								rawBoxContent += routeElement;
							}
						}); // end forEach() of climbs. Still in climbing spot

						rawBoxContent += '</div>';

						var boxContent = $compile(rawBoxContent)($scope);
						boxContent = boxContent[0];

					} else {
						spot.included = false;
					}


					// 2) Create the marker and add infobox
					//---------------------------
					// If included routes, create new marker for each location
					if (spot.included) {
						// console.log('Spot included');

						if ($scope.markers[key]) {
							// console.log('Marker exists');

							// marker exists, so just update info box
							$scope.markers[key].boxContent = boxContent;

							// If infowindow is open, update the content w/o closing it
							if (infoWindow.isOpen) {
								// console.log('Infowindow open');

								var infoPos = infoWindow.getPosition();
								var markerPos = $scope.markers[key].getPosition();

								if (infoPos == markerPos) {
									// console.log('Infowindow found');
									infoWindow.close();
									new google.maps.event.trigger( $scope.markers[key], 'click' );
								}

							}

						} else {
							// console.log('Creating new marker');
							// create a new marker

							var marker = new google.maps.Marker({
								title: spotTitle,
								position: new google.maps.LatLng(thisLat, thisLong),
								map: $scope.map,
								animation: 'drop',
								boxContent: boxContent
							});

							// Marker click event
							google.maps.event.addListener(marker, 'click', function(){
								infoWindow.setContent(marker.boxContent);
								infoWindow.open($scope.map, marker);
								// $scope.map.panTo( marker.getPosition() );

								//for tracking open/closed status
								infoWindow.isOpen = true;
							});

							$scope.markers[key] = marker;
						}

					} else {
						// Destroy the marker, infobox, and click-event listner
						if ($scope.markers[key]) {

							var infoPos = infoWindow.getPosition();
							var markerPos = $scope.markers[key].getPosition();

							if (infoPos == markerPos) {
								// Marker is being deleted, but the infowindow is open in that spot
								infoWindow.isOpen = false;
							}

							$scope.markers[key].setMap(null);
							$scope.markers[key] = null;

						}
					}

				}); // end forEach() of data
			}; // end drawMarkers()


			this.buildFilterList = function(data) {
				// Builds the displayed list that shows the included climbs

				angular.forEach( data, function(spot, key) {
					// Loop through each climb spot

					var thisSpot = {};

					if (spot.included) {
						thisSpot.name = spot.name;
						thisSpot.location = spot.location;
						thisSpot.climbs = [];
						thisSpot.key = key;

						angular.forEach( spot.climbs, function(climb, key){
							if (climb.included) {
								thisSpot.climbs.push(angular.copy(climb));
							}
						});

						// Turn the ratings into strings
						angular.forEach( thisSpot.climbs, function(climb, key){

							if (angular.isNumber(climb.grade)) {
								var newGrade = (climb.type == 'boulder') ?
									'V' + climb.grade.toString() :
									'5.' + climb.grade.grade;

								climb.grade = newGrade;
							}
						});

						$scope.filteredList[thisSpot.key] = thisSpot;

					} else {
						delete $scope.filteredList[key];
					}

				}); // end forEach

				// console.log('Filtered List:');
				// console.log(scope.filteredList);
			}


			// INITIALIZE FILTERS
			//=========================

			// initialize the filter
			$scope.filter = {
				type: {
					showing: true,
					roped: true,
					subtypes: {
						sport: true,
						trad: true,
						topRope: true,
					},
					boulder: true
				},
				grade: {
					showing: true,
					boulder: {
						showing: true,
						small: {
							0: true,
							1: true,
							2: true,
							3: true,
							4: true,
							5: true,
							6: true,
							7: true,
							8: true,
							9: true
						},
						large: {
							10: true,
							11: true,
							12: true,
							13: true,
							14: true,
							15: true,
							16: true
						}
					},
					roped: {
						showing: true,
						grades: {
							0: {
								grade: 6,
								include: true,
								conversion: 6
							},
							1: {
								grade: 7,
								include: true,
								conversion: 7
							},
							2: {
								grade: 8,
								include: true,
								conversion: 8
							},
							3: {
								grade: 9,
								include: true,
								conversion: 9
							},
							4: {
								grade: '10a',
								include: true,
								conversion: 10.1
							},
							5: {
								grade: '10b',
								include: true,
								conversion: 10.2
							},
							6: {
								grade: '10c',
								include: true,
								conversion: 10.3
							},
							7: {
								grade: '10d',
								include: true,
								conversion: 10.4
							},
							8: {
								grade: '11a',
								include: true,
								conversion: 11.1
							},
							9: {
								grade: '11b',
								include: true,
								conversion: 11.2
							},
							10: {
								grade: '11c',
								include: true,
								conversion: 11.3
							},
							11: {
								grade: '11d',
								include: true,
								conversion: 11.4
							},
							12: {
								grade: '12a',
								include: true,
								conversion: 12.1
							},
							13: {
								grade: '12b',
								include: true,
								conversion: 12.2
							},
							14: {
								grade: '12c',
								include: true,
								conversion: 12.3
							},
							15: {
								grade: '12d',
								include: true,
								conversion: 12.4
							},
							16: {
								grade: '13a',
								include: true,
								conversion: 13.1
							},
							17: {
								grade: '13b',
								include: true,
								conversion: 13.2
							},
							18: {
								grade: '13c',
								include: true,
								conversion: 13.3
							},
							19: {
								grade: '13d',
								include: true,
								conversion: 13.4
							},
							20: {
								grade: '14a',
								include: true,
								conversion: 14.1
							},
							21: {
								grade: '14b',
								include: true,
								conversion: 14.2
							},
							22: {
								grade: '14c',
								include: true,
								conversion: 14.3
							},
							23: {
								grade: '14d',
								include: true,
								conversion: 14.4
							},
							24: {
								grade: '15a',
								include: true,
								conversion: 15.1
							},
							25: {
								grade: '15b',
								include: true,
								conversion: 15.2
							},
							26: {
								grade: '15c',
								include: true,
								conversion: 15.3
							},
							27: {
								grade: '15d',
								include: true,
								conversion: 15.4
							}
						}
					}
				},
				rating: {
					showing: true,
					stars: {
						1: true,
						2: true,
						3: true,
						4: true,
						5: true
					}
				},
				height: {
					showing: true,
					values: {
						0: {
							height: 0,
							units: 'feet',
							included: true
						},
						1: {
							height: 10,
							units: 'feet',
							included: true
						},
						2: {
							height: 15,
							units: 'feet',
							included: true
						},
						3: {
							height: 20,
							units: 'feet',
							included: true
						},
						4: {
							height: 25,
							units: 'feet',
							included: true
						},
						5: {
							height: 30,
							units: 'feet',
							included: true
						},
						6: {
							height: 40,
							units: 'feet',
							included: true
						},
						7: {
							height: 50,
							units: 'feet',
							included: true
						},
						8: {
							height: 60,
							units: 'feet',
							included: true
						},
						9: {
							height: 70,
							units: 'feet',
							included: true
						},
						10: {
							height: 80,
							units: 'feet',
							included: true
						},
						11: {
							height: 90,
							units: 'feet',
							included: true
						},
						12: {
							height: 100,
							units: 'feet',
							included: true
						},
						13: {
							height: 120,
							units: 'feet',
							included: true
						},
						14: {
							height: 140,
							units: 'feet',
							included: true
						},
						15: {
							height: '140+',
							units: 'feet',
							included: true
						}
					}
				}
			};

			// FILTERING
			//==================

			// this is in the controller to be accessable to the slider
			this.filterBoulderGrade = function(min, max) {

				angular.forEach($scope.filteredData, function(spot, key){
					// loop through each climbing spot 
					var spotClimbs = spot.climbs;

					angular.forEach(spotClimbs, function(climb, key){
						// loop through each climb

						if (climb.type == 'boulder') {
							if (climb.grade >= min && climb.grade <= max) {
								climb.included = true;
							} else {
								climb.included = false;
							}
						}
					});
				});

				controller.drawMarkers($scope.filteredData);
				controller.buildFilterList($scope.filteredData);
			};

			this.filterRopedGrade = function(min, max) {
				// convert letter rating to floats to sort, then convert back...or edit the model
				var filterList = $scope.filter.grade.roped.grades;

				console.log('Filtering rope grades: '+ min + ' to '+ max);

				angular.forEach($scope.filteredData, function(spot, key){
					// loop through each climbing spot 
					var spotClimbs = spot.climbs;

					angular.forEach(spotClimbs, function(climb, key){
						// loop through each climb

						if (climb.type == 'roped') {
							if (climb.grade.conversion >= min && climb.grade.conversion <= max) {
								climb.included = true;
							} else {
								climb.included = false;
							}
						}
					});
				});

				controller.drawMarkers($scope.filteredData);
				controller.buildFilterList($scope.filteredData);

			};

			this.filterHeight = function(min, max) {

				var minOnly = (isNaN(max)) ? true : false;

				angular.forEach($scope.filteredData, function(spot, key){
					// loop through each climbing spot 
					var spotClimbs = spot.climbs;

					angular.forEach(spotClimbs, function(climb, key){
						// loop through each climb

						if (minOnly) {
							// no max value, so only test min
							if (climb.height >= min) {
								climb.included = true;
							} else {
								climb.included = false;
							}
						} else {
							if (climb.height >= min && climb.height <= max) {
								climb.included = true;
							} else {
								climb.included = false;
							}
						}
					});
				});

				controller.drawMarkers($scope.filteredData);
				controller.buildFilterList($scope.filteredData);
			}

		},

		link: function(scope, element, attributes, controller) {

			// LOAD DATA
			//====================
			scope.filteredData;
			scope.filteredList = {};

			// After map renders, pans, or zooms, and data loaded, create markers
			google.maps.event.addListener(scope.map, 'idle', function() {
				ClimbData.$loaded()
					.then(function(climbData){

						if (scope.filteredData === undefined) {
							scope.filteredData = angular.copy(climbData);
						}

						console.log('Filtered climb data:');
						console.log(scope.filteredData);

						controller.drawMarkers(scope.filteredData);
						controller.buildFilterList(scope.filteredData);
					})
					.catch(function(err){
						console.error(err);
					});
			});


			// FILTERING
			//==================

			// Filter the markers on clicks

			scope.filterType = function(type) {

				var subfilter = (type == 'sport' || type == 'trad' || type == 'topRope') ? true : false;

				angular.forEach(scope.filteredData, function(value, key){
					// loop through each climbing spot 
					var spotClimbs = value.climbs;

					angular.forEach(spotClimbs, function(climb, key){
						// loop through each climb

						if (subfilter) {
							if (climb.subtype == type) {
								climb.included = scope.filter.type.subtype[type];
							}
						} else if (climb.type == type) {
							// identify the climbs that will be filtered, then set to bool, kept track in checkbox
							climb.included = scope.filter.type[type];
						}
					});
				});

				controller.drawMarkers(scope.filteredData);
				controller.buildFilterList(scope.filteredData);
			};

			scope.filterStarRating = function(star) {

				angular.forEach(scope.filteredData, function(value, key){

					var spotClimbs = value.climbs;

					angular.forEach(spotClimbs, function(climb, key){
						// loop through each climb

						if (climb.rating == star) {
							climb.included = scope.filter.rating.stars[star];
						}
					});

				});

				controller.drawMarkers(scope.filteredData);
				controller.buildFilterList(scope.filteredData);
			};

			scope.filterHeight = function(height) {
				console.log(height);


			};

			scope.resetFilters = function(bool) {

				// define recursive function for filter obj
				var loopFilter = function(obj){

					angular.forEach(obj, function(val, key){

						if (angular.isArray(val) || angular.isObject(val)) {
							loopFilter(val); // call self if object
						} else if (key != 'showing') { // don't change controls view
							obj[key] = bool;
						}
					});
				};

				// show/hide all climbs
				var showClimbs = function(data, booli) {
					angular.forEach( data, function(val, key){
						// Loop through each climb spot
						val.included = booli;

						// for each route, construct the HTML within infobox
						angular.forEach( val.climbs, function(climb, key){
							climb.included = booli;
						});
					});

				};

				loopFilter(scope.filter);
				showClimbs(scope.filteredData, bool);
				controller.drawMarkers(scope.filteredData);
				controller.buildFilterList(scope.filteredData);

				console.log('Filter');
				console.log(scope.filter);
				console.log('Climbs');
				console.log(scope.filteredData);
			};


			// SHOW/HIDE CONTROLS
			//=========================
			scope.showResultList = false;

			scope.toggleList = function() {
				scope.showResultList = !scope.showResultList;
			};
			scope.viewResultsList = function() {
				scope.showResultList = true;
			};

			scope.showMarker = function(key) {
				new google.maps.event.trigger( scope.markers[key], 'click' );
			};

			scope.toggleFilter = function(cat) {
				scope.filter[cat].showing = !scope.filter[cat].showing;
			};


			// MANAGE LISTS
			//=======================
			scope.userProfile = User.user();
			scope.tempListName;
			scope.currentClimb;

			// Create/add lists
			scope.addList = function(listName) {

				if (scope.userProfile.lists == undefined) {
					scope.userProfile.lists = {};
				}

				scope.userProfile.lists[listName] = [];

				console.log('Adding list to client object:');
				console.log(scope.userProfile);

				User.save(scope.userProfile).then(
					function(response){
						console.log('list added and saved to user firebase object:');
						console.log(scope.userProfile);
					},
					function(err) {
						console.error('Error creating list: '+ err);
					}
				);

			};

			// Add climb to list
			scope.addToList = function(climb, list){

				// TODO: add test for if climb is already in the list

				list.push(climb);

				console.log(climb.name +' added to list');
				console.log(scope.userProfile);

				User.save(scope.userProfile).then(
					function(response){
						console.log('Climb added and saved to list:');
						console.log(scope.userProfile);
						console.log(response);
					},
					function(err) {
						console.error('Error adding climb to list: '+ err);
					}
				);
			};

			// Remove climb from list

			// Delete list




			// CLIMB DETAILS
			//=====================
			scope.currentClimb;
			scope.showClimbDetails = false

			scope.showDetails = function(climb){
				scope.currentClimb = climb;
				scope.showClimbDetails = true;
			};
			// scope.showClimbFromInfo = function(name) {
			// 	// loop through each climb to find the object
			// 	angular.forEach(scope.filteredData, function(spot, key){
			// 		// loop through each climbing spot 
			// 		var spotClimbs = spot.climbs;

			// 		angular.forEach(spotClimbs, function(climb, key){
			// 			if (name == climb.name) {
			// 				scope.showDetails(climb);
			// 				return;
			// 			}
			// 		});
			// 	});
			// }

		} // end link
	} // end return obj
}]);












app.directive('jdMapSelect', [ function(){
	return {
		restrict: 'E',
		templateUrl: 'js/directives/mapSelect.html',
		link: function(scope, element, attributes) {

			// render google map
			// use center of map for location
			// on 'idle', set the newLocation lat/lng in the view,
			// when form is submitted, retrieve place details
				// city
				// state

			// RENDERING
			//=======================

			// Default location = Berkely, CA
			scope.newClimb.newLocation.latitude = 37.869531850846045;
			scope.newClimb.newLocation.longitude = -122.26456025390627;

			var mapCenter = new google.maps.LatLng(scope.newClimb.newLocation.latitude, scope.newClimb.newLocation.longitude);

			var mapElement = document.getElementById("locationMapCanvas");
			var mapOptions = {
				center: mapCenter,
				zoom: 5,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			// Render Map
			scope.locationMap = new google.maps.Map(mapElement, mapOptions);

			// Render Marker
			scope.locationMarker = new google.maps.Marker({
				map: scope.locationMap,
				position: mapCenter,
				title: 'New Spot',
				draggable: true,
			});


			// EVENTS
			//=====================
			// Fix map rendering bug
			scope.resizeMap = function(){
				google.maps.event.trigger(scope.locationMap, 'resize');
				scope.locationMap.setZoom( scope.locationMap.getZoom() )
				scope.locationMap.setCenter( scope.locationMarker.getPosition() );
			};

			// Typing Lat, Lng
			//---------------------
			scope.manualCoordUpdate = function(){
				var center = new google.maps.LatLng(scope.newClimb.newLocation.latitude, scope.newClimb.newLocation.longitude);
				scope.locationMap.setCenter(center);
				scope.locationMarker.setPosition(center);
			};

			// Marker Drag
			//-----------------
			google.maps.event.addListener(scope.locationMarker, 'drag', function(){
				// update the scope's newLat and newLong
				var markerPos = scope.locationMarker.getPosition();

				scope.$apply( scope.newClimb.newLocation.latitude = markerPos.lat() );
				scope.$apply( scope.newClimb.newLocation.longitude = markerPos.lng() );
			});

			// Center Marker
			//-----------------
			scope.centerMarker = function() {
				// Get map center
				var center = scope.locationMap.getCenter();
				// Set marker position
				scope.locationMarker.setPosition(center);
			};

			// Marker Lock and Map Drag
			//------------------------------
			scope.markerLocked = false;
			var dragStart;
			var dragMove;

			scope.toggleMarkerLock = function() {

				scope.markerLocked = !scope.markerLocked;

				if (scope.markerLocked){
					// Bind drag event listeners

					var mapStartLat;
					var mapStartLng;
					var markerStartLat;
					var markerStartLng;

					dragStart = google.maps.event.addListener(scope.locationMap, 'dragstart', function(){
						var startMapCenter = scope.locationMap.getCenter();
						mapStartLat = startMapCenter.lat();
						mapStartLng = startMapCenter.lng();

						var markerPos = scope.locationMarker.getPosition();
						markerStartLat = markerPos.lat();
						markerStartLng = markerPos.lng();
					});
					dragMove = google.maps.event.addListener(scope.locationMap, 'drag', function(){
						// Move the marker the same distance as the map
						var newMapCenter = scope.locationMap.getCenter();
						mapNewLat = newMapCenter.lat();
						mapNewLng = newMapCenter.lng();

						var movedLat = mapStartLat - mapNewLat;
						var movedLng = mapStartLng - mapNewLng;

						var newMarkerLat = markerStartLat - movedLat;
						var newMarkerLng = markerStartLng - movedLng;

						// update scope
						scope.$apply( scope.newClimb.newLocation.latitude = newMarkerLat );
						scope.$apply( scope.newClimb.newLocation.longitude = newMarkerLng );

						// update position
						var updatedMarkerPos = new google.maps.LatLng(newMarkerLat, newMarkerLng);
						scope.locationMarker.setPosition(updatedMarkerPos);
					});

				} else {
					// Unbind drag event listener

					google.maps.event.removeListener(dragStart);
					google.maps.event.removeListener(dragMove);

				}
			};


		}
	}
}]);

app.directive('jdProfileView', ['User', function(User){
	return {
		restrict: 'E',
		templateUrl: "js/directives/profileView.html",
		link: function(scope, element, attributes) {

			scope.userProfile = User.user();
			console.log('User Profile (User.user):');
			console.log(scope.userProfile);

			// SHOW/HIDE CONTROLS
			//==================================
			scope.updatePassForm = false;
			scope.updateEmailForm = false;
			scope.deleteUserForm = false;

			scope.showUpdatePass = function(){
				scope.updatePassForm = true;
				scope.updateEmailForm = false;
				scope.deleteUserForm = false;
			};
			scope.showUpdateEmail = function(){
				scope.updatePassForm = false;
				scope.updateEmailForm = true;
				scope.deleteUserForm = false;
			};
			scope.showDeleteUser = function(){
				scope.updatePassForm = false;
				scope.updateEmailForm = false;
				scope.deleteUserForm = true;
			};


			// UPDATE PROFILE
			//=================================

			scope.tempEmailUpdate = {
				newEmail: '',
				oldEmail: '',
				pass: ''
			};
			scope.tempPassUpdate = {
				email: '',
				oldPass: '',
				newPass: ''
			};
			scope.deleteUserObj = {
				email: '',
				pass: ''
			}

			scope.saveProfile = function() {

				User.save(scope.userProfile).then(
					function(response) {
						console.log('Profile saved');
						console.log(response);
					},
					function(err) {
						console.error('Error saving user profile: '+ err);
					}
				);
			};

			scope.updatePassword = function() {
				Auth.updatePassword(scope.tempPassUpdate).then(
					function(response) {
						console.log('Password updated');
						console.log(response);
					},
					function(err) {
						console.error('Error updating password: '+ err);
					}
				);
			};

			scope.updateEmail = function() {
				Auth.updateEmail(scope.tempEmailUpdate).then(
					function(response) {
						console.log('Email updated');
						console.log(response);
					},
					function(err) {
						console.error('Error updating email: '+ err);
					}
				);				
			};

			scope.deleteAccount = function() {
				Auth.deleteUser(scope.deleteObj).then(
					function(response) {
						console.log('User deleted');
						console.log(response);

						// Also remove from user data
					},
					function(err) {
						console.error('Error deleting user: '+ err);
					}
				);	

			};

		}
	}
}]);

app.directive('jdSlider', ['$document', function($document){
	return {
		restrict: 'E',
		templateUrl: 'js/directives/slider.html',
		require: '^jdMapFilter',
		scope: {
			filter: '='
		},
		link: function(scope, element, attr, mapCtrl) {

			// Initialize
			//=====================
			var fullWidth = angular.element('.slider-container').width();
			var ropedGradeList;
			var heightList;
			scope.currentMinPos = 0;
			scope.currentMaxPos = fullWidth;
			scope.currentSlider = null;
			scope.lastMaxIndex;
			scope.lastMinIndex;

			if (attr.type == 'boulder') {

				var gradeWidth = fullWidth/16;
				scope.currentMin = 0;
				scope.currentMax = 16;
				scope.currentMinIndex = 0;
				scope.currentMaxIndex = 16;

			} else if (attr.type == 'roped') {

				ropedGradeList = scope.filter.grade.roped.grades;
				var listLength = Object.keys(ropedGradeList).length;
				var gradeWidth = fullWidth/(listLength-1);

				scope.currentMin = ropedGradeList[0].grade;
				scope.currentMax = ropedGradeList[listLength-1].grade;
				scope.currentMinIndex = 0;
				scope.currentMaxIndex = listLength-1;

			} else if (attr.type == 'height') {

				heightList = scope.filter.height.values;
				var listLength = Object.keys(heightList).length;
				var gradeWidth = fullWidth/(listLength-1);

				scope.currentMin = heightList[0].height.toString() + '\'';
				scope.currentMax = heightList[listLength-1].height.toString() + '\'';
				scope.currentMinIndex = 0;
				scope.currentMaxIndex = listLength-1;

			} else {
				console.error('Please enter a valid "type" attribute for the slider');
				return;
			}


			// Click behaviors
			//=====================
			var elStartPos;
			var clickedEl;
			var clickDownPos = 0;

			scope.startMove = function(id, event) {
				scope.currentSlider = id;

				// Get current element
				clickedEl = element.find('#slider-'+id);
				elStartPos = parseInt( clickedEl.css('left'), 10);

				// Get initial mouse pos
				clickDownPos = event.pageX;

				// Set inital index
				scope.lastMaxIndex = angular.copy(scope.currentMaxIndex);
				scope.lastMinIndex = angular.copy(scope.currentMinIndex);

				// Set-up drag behavior
				$document.on('mousemove', moveMarker);
				$document.on('mouseup', stopMarker);
			}

			var moveMarker = function(e) {
				var mousePos = e.pageX;
				var movedDist = mousePos - clickDownPos;
				var elPos = elStartPos + movedDist;
				var newElPos;

				if (scope.currentSlider == 'min') {

					newElPos = (elPos > scope.currentMaxPos) ? scope.currentMaxPos :
									(elPos < 0) ? 0 : elPos;

					var newIndex = Math.round(newElPos/gradeWidth);

					if (attr.type == 'roped') {
						newGrade = ropedGradeList[newIndex].grade;
					} else if ( attr.type == 'height') {
						newGrade = heightList[newIndex].height.toString() + '\'';
					} else {
						newGrade = newIndex;
					}

					scope.$apply( scope.currentMin = newGrade );
					scope.currentMinIndex = newIndex;
					scope.currentMinPos = newElPos;
					// console.log('Updated currentMin: '+ scope.currentMin);
				} else {

					newElPos = (elPos > fullWidth) ? fullWidth :
									(elPos < scope.currentMinPos) ? scope.currentMinPos : elPos;

					var newIndex = Math.round(newElPos/gradeWidth);

					if (attr.type == 'roped') {
						newGrade = ropedGradeList[newIndex].grade;
					} else if ( attr.type == 'height') {
						newGrade = heightList[newIndex].height.toString() + '\'';
					} else {
						newGrade = newIndex;
					}

					scope.$apply( scope.currentMax = newGrade );
					scope.currentMaxIndex = newIndex;
					scope.currentMaxPos = newElPos;
					// console.log('Updated currentMax: '+ scope.currentMax);
				}

				clickedEl.css('left', newElPos);
			}

			var stopMarker = function(e) {
				$document.off('mousemove', moveMarker);
				$document.off('mouseup', stopMarker);

				var finalPos;

				if (scope.currentSlider == 'min') {
					finalPos = scope.currentMinIndex * gradeWidth;
				} else {
					finalPos = scope.currentMaxIndex * gradeWidth;
				}

				clickedEl.css('left', finalPos);
				scope.clickedEl = null;
				scope.currentSlider = null;

				// Test if values actually changed
				if (scope.currentMaxIndex == scope.lastMaxIndex && scope.currentMinIndex == scope.lastMinIndex) {
					console.log('...Slider values remained the same...')
					return;
				} else {
					// Call the filter function to update map
					if (attr.type == 'roped') {
						mapCtrl.filterRopedGrade( ropedGradeList[scope.currentMinIndex].conversion, ropedGradeList[scope.currentMaxIndex].conversion );
					} else if ( attr.type == 'height') {
						mapCtrl.filterHeight( heightList[scope.currentMinIndex].height, heightList[scope.currentMaxIndex].height);
					} else {
						mapCtrl.filterBoulderGrade(scope.currentMinIndex, scope.currentMaxIndex);
					}
				}

				// update the filter list
				scope.$apply();
			}
		}
	}
}]);
app.directive('jdUploadView', ['ClimbData', 'SpotData', 'Places', function(ClimbData, SpotData, Places){
	return {
		restrict: 'E',
		templateUrl: 'js/directives/uploadView.html',
		link: function(scope, element, attributes) {

			// Attach climb data to scope
			//--------------------------------
			ClimbData.$loaded(function(data){
				scope.climbData = data;
				console.log('ClimbData in Upload View');
				console.log(scope.climbData);
			});


			// Form Data Initialization
			//-------------------------------
			scope.newClimb = {};

			// These are just for reference
			scope.newClimb.newOrOld = 'old';
			scope.newClimb.newLocation = {};

			scope.setGradeOptions = function(){
				if (scope.newClimb.climbType == 'boulder') {
					scope.gradeOptions = [
						{number: 0, fullGrade: 'V0'},
						{number: 1, fullGrade: 'V1'},
						{number: 2, fullGrade: 'V2'},
						{number: 3, fullGrade: 'V3'},
						{number: 4, fullGrade: 'V4'},
						{number: 5, fullGrade: 'V5'},
						{number: 6, fullGrade: 'V6'},
						{number: 7, fullGrade: 'V7'},
						{number: 8, fullGrade: 'V8'},
						{number: 9, fullGrade: 'V9'},
						{number: 10, fullGrade: 'V10'},
						{number: 11, fullGrade: 'V11'},
						{number: 12, fullGrade: 'V12'},
						{number: 13, fullGrade: 'V13'},
						{number: 14, fullGrade: 'V14'},
						{number: 15, fullGrade: 'V15'},
						{number: 16, fullGrade: 'V16'}
					];
				} else {
					scope.gradeOptions = [
						{number: 6, fullGrade: '5.6'},
						{number: 7, fullGrade: '5.7'},
						{number: 8, fullGrade: '5.8'},
						{number: 9, fullGrade: '5.9'},
						{number: 10.1, fullGrade: '5.10a'},
						{number: 10.2, fullGrade: '5.10b'},
						{number: 10.3, fullGrade: '5.10c'},
						{number: 10.4, fullGrade: '5.10d'},
						{number: 11.1, fullGrade: '5.11a'},
						{number: 11.2, fullGrade: '5.11b'},
						{number: 11.3, fullGrade: '5.11c'},
						{number: 11.4, fullGrade: '5.11d'},
						{number: 12.1, fullGrade: '5.12a'},
						{number: 12.2, fullGrade: '5.12b'},
						{number: 12.3, fullGrade: '5.12c'},
						{number: 12.4, fullGrade: '5.12d'},
						{number: 13.1, fullGrade: '5.13a'},
						{number: 13.2, fullGrade: '5.13b'},
						{number: 13.3, fullGrade: '5.13c'},
						{number: 13.4, fullGrade: '5.13d'},
						{number: 14.1, fullGrade: '5.14a'},
						{number: 14.2, fullGrade: '5.14b'},
						{number: 14.3, fullGrade: '5.14c'},
						{number: 14.4, fullGrade: '5.14d'},
						{number: 15.1, fullGrade: '5.15a'},
						{number: 15.2, fullGrade: '5.15b'},
						{number: 15.3, fullGrade: '5.15c'},
						{number: 15.4, fullGrade: '5.15d'},
					];
				}
			};


			// Submit
			//--------------------------
			scope.createNewClimb = function() {

				console.log('Upload Form:');
				console.log(scope.uploadForm);

				var setGrade = function(climbGrade, climbType) {
					if (climbType == 'boulder') {
						return parseInt(climbGrade);
					} else {
						// console.log('Original climbGrade: ');
						// console.log(climbGrade);
						var gradeObj = {};

						if (climbGrade.number > 9) {
							var shortGrade = climbGrade.fullGrade.split('.')[1];

							gradeObj = {
								grade: shortGrade,
								conversion: climbGrade.number
							}

						} else {
							gradeObj = {
								grade: gradeInt,
								conversion: gradeInt
							}
						}
						return gradeObj;
					}
				}

				var climbObj = {
					description: scope.newClimb.climbDescription,
					grade: setGrade(scope.newClimb.climbGrade, scope.newClimb.climbType),
					height: scope.newClimb.climbHeight,
					name: scope.newClimb.climbName,
					rating: parseInt(scope.newClimb.climbRating),
					type: scope.newClimb.climbType,
					subtype: scope.newClimb.climbSubType
				};

				console.log('New Climb Obj:');
				console.log(climbObj);

				// If adding to existing climb
				//-------------------------------
				if (scope.newClimb.newOrOld == 'old') {

					var targetSpot = scope.climbData[scope.newClimb.climbLocation];
					var targetId = targetSpot.$id;
					console.log('Target Spot:');
					console.log(targetSpot);

					// 1) Retrieve the climb array as a firebaseArray
					SpotData.get(targetId).$loaded(
						function(data){
							console.log('Climbs within desired spot recieved as FirebaseArray:');
							console.log(data);

							// 2) Push new climb to firebase
							data.$add(climbObj).then(
								function(ref){
									console.log(climbObj.name +' successfully added to '+ targetSpot.name)
								}
							);
						},
						function(err){
							console.error('ERROR: Could not retrieve sibling climbs. '+ err);
						}
					);


				// If creating a new spot
				//---------------------------------
				} else {

					// 1) Get location details
					var newSpotLatLng = new google.maps.LatLng(scope.newClimb.newLocation.latitude, scope.newClimb.newLocation.longitude);

					Places.geocode(newSpotLatLng).then(
						function(results){
							console.log('New location details recieved: ');
							console.log(results);

							var findSpotDetails = function(results_array){
								for (var i = 0; i < results_array.length; i++) {
									var result = results_array[i];
									for (var h = 0; h < result.types.length; h++) {
										console.log('Type: '+ result.types[h])
										if (result.types[h] == 'postal_code') {
											scope.newClimb.newLocation.details = result;
											return true;
										}
									}
								}
								console.error('ERROR: Could not find "postal_code" of the new location.');
								return false;
							};

							var findSpotState = function(address_components) {
								for (var i = 0; i < address_components.length; i++) {
									var component = address_components[i];
									for (var h = 0; h < component.types.length; h++) {
										console.log('Type: '+ component.types[h])
										if (component.types[h] == 'administrative_area_level_1') {
											scope.newClimb.newLocation.details['state_code'] = component.short_name;
											scope.newClimb.newLocation.details['state_name'] = component.long_name;
											return true;
										}
									}
								}
								console.error('ERROR: New Spot does not have a state associated with it.');
								return false
							};

							// get and format spot info
							if (findSpotDetails(results)) {
								findSpotState(scope.newClimb.newLocation.details.address_components);
								console.log('New Location details updated. New Climb:');
								console.log(scope.newClimb);
							}

							// 2) Construct location object without climb added
							var newSpotObj = {
								climbs: [],
								location: {
									lat: scope.newClimb.newLocation.latitude,
									long: scope.newClimb.newLocation.longitude,
									state_name: scope.newClimb.newLocation.details.state_name,
									state_code: scope.newClimb.newLocation.details.state_code
								},
								name: scope.newClimb.newLocation.name,
								details: scope.newClimb.newLocation.details
							}

							console.log('Structured new climbing spot without climb:');
							console.log(newSpotObj);

							// 3) Save new spot
							ClimbData.$add(newSpotObj).then(
								function(ref){
									//TODO: get id of ref, then call SpotData.get(id), then $add the climbObj
									console.log(newSpotObj.name +' added to database. Adding climb to spot...');
									var id = ref.key();

									// 4) Add climb to spot
									SpotData.get(id).$loaded(
										function(data){
											data.$add(climbObj).then(
												function(ref){
													console.log(climbObj.name +' successfully added to '+ newSpotObj.name);

													// TODO:
														// Show success/thanks message but stay in upload (once it is it's own route)
														// Reset the upload route form to empty
												},
												function(err){
													console.error('ERROR: Error adding '+ climbObj.name +' to '+ newSpotObj.name);
												}
											);
										},
										function(err){
											console.error('ERROR: Error retrieving the new location\'s climb data: '+ err);
										}
									);
								},
								function(err){

								}
							);

							console.log('Updated climbData:');
							console.log(scope.climbData);


						},
						function(err){
							console.error('Error retrieving new location details before saving the climb to the database: '+ err);
						}
					);
				}
			};

			scope.showPreview = true;

		}
	};
}]);

app.factory('Auth', ["$firebaseAuth", '$firebaseObject', "FIREBASE_URL", 'User', function($firebaseAuth, $firebaseObject, FIREBASE_URL, User) {

	var ref = new Firebase(FIREBASE_URL);
	var auth = $firebaseAuth(ref);

	var Auth = {
		register: function(user) {
			return auth.$createUser(user).then(
				function(userData){
					// Create user profile in database
					newUser = {};
					newUser.uid = userData.uid;
					newUser.info = {
						email: userData.password.email
					};
					newUser.lists = {};

					return User.add(newUser);

					// .then(
					// 	function(response){
					// 		console.log('User profile created');
					// 		console.log(response);
					// 	},
					// 	function(err){
					// 		console.error('Error creating user profile: '+ err);
					// 	}
					// );

				}, function(err){
					console.error('Error registering new user: '+ err);
				});

		},
		login: function(user) {
			return auth.$authWithPassword(user).then(
				function(response){
					console.log('Logged-in. Fetching profile. First response:');
					console.log(response);

					// Get user profile
					ref = new Firebase(FIREBASE_URL + '/users/' + response.uid);
					userObj = $firebaseObject(ref);
					return userObj;//use $loaded() to use returned promise
				},
				function(err) {
					console.error('Error retrieving user profile:' + err);
				}
			);
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
		updatePassword: function(obj) {
			return auth.$changePassword(obj); // return promise
		},
		updateEmail: function(obj) {
			return auth.$changeEmail(obj); // return promise
		},
		deleteUser: function(obj) {
			return auth.$removeUser(obj); // return promise
		},
		user: {}
	};

	auth.$onAuth( function(user) {
		if (user) {
			// logged in...
			console.log('logged in');
			angular.copy(user, Auth.user);

			if (!User.uid) {
				console.log('-Fetching profile');
				console.log(Auth.user.uid);
				User.get(Auth.user.uid).$loaded(function(profileData){
					console.log('--Profile retrieved:');
					console.log(profileData);
				});

			} else {
				console.log('Profile already loaded');
				console.log(User.user());
			}
		} else {
			// logged out...
			console.log('logged out');
			angular.copy({}, Auth.user);

			// TODO: signal to scope that logged out
		}
	});

	return Auth;
}]);



app.factory('ClimbData', ["FIREBASE_URL", "$firebaseArray", 
	function(FIREBASE_URL, $firebaseArray){

	// Get data
	var ref = new Firebase(FIREBASE_URL + '/data');
	var data = $firebaseArray(ref);

	return data; // returns a promise for the data. Use $loaded method
}]);


app.factory('Places', ['$q', function($q){

	// var places = new google.maps.places.PlacesService(map);
	var autoComplete = new google.maps.places.AutocompleteService();
	var geocoder = new google.maps.Geocoder();

	var places = {
		autocomplete: function(query) {

			if (query) {
				var searchObj = {
					input: query,
					types: '(cities)',
					componentRestrictions: {country: 'us'}
				};

				return $q(function(resolve, reject){
					autoComplete.getQueryPredictions(searchObj, function(predictions, status) {
						if (status != google.maps.places.PlacesServiceStatus.OK) {
							reject('Error retrieving autocomplete: '+ status);
						} else {
							resolve(predictions);
						}
					});
				});
			} else {
				// still need to return a promise
				return $q(function(resolve, reject){
					reject('No input present');
				});
			}
		}, //end autocomplete()
		geocode: function(param) {
			// can be used with lat/lng or autocomplete place name as param

			if (param != "") {

				var detailsObj = (angular.isString(param)) ? {'address': param} : {'latLng': param}

				return $q(function(resolve, reject){
					geocoder.geocode( detailsObj, function(result, status) {
						if (status != google.maps.GeocoderStatus.OK) {
							reject('Error retrieving place coordinates: '+ status);	
						} else {
							resolve(result);
						}
					});
				});
			}
		}, //end geocode
		currentSearch: false, // store geocode result here to use with map

		userLocation: false,
		setUserLocation: function() {

			return $q(function(resolve, reject){
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(geoObj){
						var userLat = geoObj.coords.latitude;
						var userLng = geoObj.coords.longitude;
						places.userLocation = new google.maps.LatLng(userLat, userLng);
						console.log('Can use location:');
						console.log(places);
						resolve(true);
					});
				} else {
					console.log('User browser does not support geolocation. Please upadate your browser.');
					reject(false);
				}

			});

			// if (navigator.geolocation) {
			// 	navigator.geolocation.getCurrentPosition(function(geoObj){
			// 		var userLat = geoObj.coords.latitude;
			// 		var userLng = geoObj.coords.longitude;
			// 		places.userLocation = new google.maps.LatLng(userLat, userLng);
			// 		console.log('Can use location:');
			// 		console.log(places);
			// 		return true;
			// 	});
			// } else {
			// 	console.log('User browser does not support geolocation. Please upadate your browser.');
			// 	return false;
			// }
		}
	}

	return places;
}]);

app.factory('SpotData', ["FIREBASE_URL", "$firebaseArray", 
	function(FIREBASE_URL, $firebaseArray){

	var spotData = {
		get: function(spotId) {
			var ref = new Firebase(FIREBASE_URL + '/data/' + spotId + '/climbs');
			var data = $firebaseArray(ref);

			return data;
		}
	}

	return spotData; // returns a promise for the data. Use $loaded method
}]);


app.factory('User', ['$firebaseObject', 'FIREBASE_URL', 
	function($firebaseObject, FIREBASE_URL){

	var ref;
	var userObj;

	// Get user
	var user = {
		get: function(uid) {
			ref = new Firebase(FIREBASE_URL + '/users/' + uid);
			userObj = $firebaseObject(ref);
			return userObj;//use $loaded() to use returned promise
		},
		add: function(newUser) {
			// push to users obj and save
			ref = new Firebase(FIREBASE_URL + '/users');
			userObj = $firebaseObject(ref);

			usersObj[newUser.uid] = newUser;
			return usersObj.$save(); // returns promise
		},
		save: function(obj) {
			return obj.$save(); // returns promise. Obj is firebase object
		},
		user: function(){
			return userObj;
		}
	}

	return user;
}]);