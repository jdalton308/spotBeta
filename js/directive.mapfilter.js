
app.directive('jdMapFilter', ['ClimbData', 'Places', 'User', function(ClimbData, Places, User){
	return {
		restrict: 'E',
		templateUrl: "directives/mapFilter.html",
		controller : function($scope) {

			var controller = this; 

			// RENDERING
			//=====================

			// Draw map
			if (Places.currentSearch) {
				// Check for search results
				var currentLat = Places.currentSearch.geometry.location.A;
				var currentLong = Places.currentSearch.geometry.location.F;
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

			var infoWindow = new google.maps.InfoWindow();

			google.maps.event.addListener(infoWindow, 'closeclick', function(){
				infoWindow.isOpen = false;
			});


			// UTILITY FUNCTIONS
			//========================

			// Markers/Marker click events function
			this.drawMarkers = function(data) {

				// Determine what is included and create infobox
				//---------------------------
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
								grade = "V" + climb.grade;
							} else {
								grade = "5." + climb.grade;
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
				

				// Create the marker and add infobox
				//---------------------------
					// If included routes, create new marker for each location
					if (val.included) {
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
								$scope.map.panTo( marker.getPosition() );

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

				}); // end forEach()
			}; // end drawMarkers()


			this.buildFilterList = function(data) {

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
									'5.' + climb.grade.toString();

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

			$scope.filteredData;
			$scope.filteredList = {};

			ClimbData.$loaded()
				.then(function(data){
					console.log('Data in directive');
					console.log(data);

					originalData = angular.copy(data);
					$scope.filteredData = angular.copy(data);

					controller.drawMarkers($scope.filteredData);
					controller.buildFilterList($scope.filteredData);
				})
				.catch(function(err){
					console.error(err);	
				});


			// initialize the filter
			$scope.filter = {
				type: {
					showing: true,
					roped: true,
					sport: true,
					trad: true,
					topRope: true,
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
								grade: '11a',
								include: true,
								conversion: 11.2
							}
						}
						// '11c': true,
						// '11d': true,
						// '12a': true,
						// '12b': true,
						// '12c': true,
						// '12d': true,
						// '13a': true,
						// '13b': true,
						// '13c': true,
						// '13d': true,
						// '14a': true,
						// '14b': true,
						// '14c': true,
						// '14d': true,
						// '15a': true,
						// '15b': true,
						// '15c': true,
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
					groups: {
						'<10': true,
						'10-15': true,
						'15-20': true,
						'20-30': true,
						'30-40': true,
						'40-50': true,
						'50-70': true,
						'70-100': true,
						'100-150': true,
						'150+': true
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

						if (climb.grade >= min && climb.grade <= max) {
							climb.included = true;
						} else {
							climb.included = false;
						}
					});
				});

				controller.drawMarkers($scope.filteredData);
				controller.buildFilterList($scope.filteredData);
			}

			this.filterRopedGrade = function(min, max) {
				// convert letter rating to floats to sort, then convert back...or edit the model

				console.log('Filtering rope grade: '+ min + ' to '+ max);
			}

		},
		link: function(scope, element, attributes, controller) {


			// FILTERING
			//==================

			// Filter the markers on clicks

			scope.filterType = function(type) {

				// console.log(scope.filter);

				angular.forEach(scope.filteredData, function(value, key){
					// loop through each climbing spot 
					var spotClimbs = value.climbs;

					angular.forEach(spotClimbs, function(climb, key){
						// loop through each climb

						if (climb.type == type) {
							// identify the climbs that will be filtered, then set to bool, kept track in checkbox
							climb.included = scope.filter.type[type];
						}
					});
				});

				controller.drawMarkers(scope.filteredData);
				controller.buildFilterList(scope.filteredData);
			};

			scope.filterStarRating = function(star) {
				console.log(scope.filter);

				angular.forEach(scope.filteredData, function(value, key){

					var spotClimbs = value.climbs;

					angular.forEach(spotClimbs, function(climb, key){
						// loop through each climb

						if (climb.rating == star) {
							// console.log('Climb found with star rating:');
							// console.log(climb);

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

		} // end link
	} // end return obj
}]);