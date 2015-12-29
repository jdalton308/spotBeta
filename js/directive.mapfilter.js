
app.directive('jdMapFilter', ['ClimbData', 'Places', 'User', 'GradeRef', '$compile', '$routeParams', function(ClimbData, Places, User, GradeRef, $compile, $routeParams){
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

				console.log('Current Search:');
				console.log(Places.currentSearch);

				// Check for search results
				var currentLat = Places.currentSearch.geometry.location.lat();
				var currentLong = Places.currentSearch.geometry.location.lng();

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

					// console.log('Map Bounds:');
					// console.log($scope.mapBounds);
					// console.log('Spot:');
					// console.log(spot);

					// console.log('Contains test:');
					// console.log($scope.mapBounds.contains(new google.maps.LatLng(thisLat, thisLong)));

					// Show spot if within map's bounds
					if ( $scope.mapBounds.contains(new google.maps.LatLng(thisLat, thisLong)) ) {

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

								if (climb.type == 'boulder') {
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

								var newClimb = angular.copy(climb);

								// Turn ratings into strings
								var newGrade = (newClimb.type == 'boulder') ?
									'V' + newClimb.grade :
									'5.' + newClimb.grade.grade;

								newClimb.grade = newGrade;

								thisSpot.climbs.push(newClimb);
							}
						});

						$scope.filteredList[thisSpot.key] = thisSpot;

					} else {
						delete $scope.filteredList[key];
					}

				}); // end forEach

			}


			// INITIALIZE FILTERS
			//=========================

			// initialize the filter from factory
			$scope.filter = GradeRef;


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











