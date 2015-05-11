
app.directive('jdMapFilter', ['ClimbData', 'User', function(ClimbData, User){
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

			google.maps.event.addListener(infoWindow, 'closeclick', function(){
				infoWindow.isOpen = false;
			});


			// Markers/Marker click events function
			var drawMarkers = function(data) {

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

						if (scope.markers[key]) {
							// console.log('Marker exists');

							// marker exists, so just update info box
							scope.markers[key].boxContent = boxContent;

							// If infowindow is open, update the content w/o closing it
							if (infoWindow.isOpen) {
								// console.log('Infowindow open');

								var infoPos = infoWindow.getPosition();
								var markerPos = scope.markers[key].getPosition();

								if (infoPos == markerPos) {
									// console.log('Infowindow found');
									infoWindow.close();
									new google.maps.event.trigger( scope.markers[key], 'click' );
								}

							}

						} else {
							// console.log('Creating new marker');
							// create a new marker

							var marker = new google.maps.Marker({
								title: spotTitle,
								position: new google.maps.LatLng(thisLat, thisLong),
								map: scope.map,
								animation: 'drop',
								boxContent: boxContent
							});

							// Marker click event
							google.maps.event.addListener(marker, 'click', function(){
					            infoWindow.setContent(marker.boxContent);
					            infoWindow.open(scope.map, marker);
								scope.map.panTo( marker.getPosition() );

								//for tracking open/closed status
								infoWindow.isOpen = true;
							});

							scope.markers[key] = marker;
						}

					} else {
						// Destroy the marker, infobox, and click-event listner
						if (scope.markers[key]) {

							var infoPos = infoWindow.getPosition();
							var markerPos = scope.markers[key].getPosition();

							if (infoPos == markerPos) {
								// Marker is being deleted, but the infowindow is open in that spot
								infoWindow.isOpen = false;
							}

							scope.markers[key].setMap(null);
							scope.markers[key] = null;

						}
					}

				}); // end forEach()
			}; // end drawMarkers()


			var buildFilterList = function(data) {

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

						scope.filteredList[thisSpot.key] = thisSpot;

					} else {
						delete scope.filteredList[key];
					}

				}); // end forEach

				// console.log('Filtered List:');
				// console.log(scope.filteredList);
			}


			// INITIALIZE
			//=====================

			var originalData;
			scope.filteredData;
			scope.filteredList = {};

			ClimbData.$loaded()
				.then(function(data){
					// console.log('Data in directive');
					// console.log(data);

					originalData = angular.copy(data);
					scope.filteredData = angular.copy(data);

					drawMarkers(scope.filteredData);
					buildFilterList(scope.filteredData);
				})
				.catch(function(err){
					console.error(err);	
				});


			// initialize the filter
			scope.filter = {
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
						6: true,
						7: true,
						8: true,
						9: true,
						'10a': true,
						'10b': true,
						'10c': true,
						'10d': true,
						'11a': true,
						'11b': true,
						'11c': true,
						'11d': true,
						'12a': true,
						'12b': true,
						'12c': true,
						'12d': true,
						'13a': true,
						'13b': true,
						'13c': true,
						'13d': true,
						'14a': true,
						'14b': true,
						'14c': true,
						'14d': true,
						'15a': true,
						'15b': true,
						'15c': true,
					}
				}
			};


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

				drawMarkers(scope.filteredData);
				buildFilterList(scope.filteredData);
			};

			scope.filterBoulderGrade = function(grade) {

				// console.log(scope.filter);

				angular.forEach(scope.filteredData, function(value, key){
					// loop through each climbing spot 
					var spotClimbs = value.climbs;

					angular.forEach(spotClimbs, function(climb, key){
						// loop through each climb

						if (climb.grade == grade) {
						// identify the climbs that will be filtered, then set to bool, kept track in checkbox
							climb.included = (grade > 9) ?
								scope.filter.grade.boulder.large[grade] :
								scope.filter.grade.boulder.small[grade];
						}
						
					});
				});

				drawMarkers(scope.filteredData);
				buildFilterList(scope.filteredData);
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
			scope.userProfile = User.user;
			scope.tempListName;
			scope.currentClimb;

			// Show/hide
			scope.addListCont = false;
			scope.addNewListCont = false;

			scope.showAddListCont = function(climb) {

				// TODO: add window position
				var newPos;

				scope.currentClimb = climb;
				scope.addListCont = true;
			};
			scope.hideListCont = function() {
				scope.addListCont = false;
			};
			scope.toggleAddNewList = function() {
				scope.addNewListCont = !scope.addNewListCont;
			};

			// Create/add lists
			scope.addList = function() {

				if (User.user.lists == undefined) {
					User.user.lists = {};
				}

				User.user.lists[scope.tempListName] = [];
				User.save(User.user).then(
					function(response){
						console.log('list added to user object:');
						console.log(User.user);
						console.log(response);
					},
					function(err) {
						console.error('Error creating list: '+ err);
					}
				);

			};

			// Add climb to list
			scope.addToList = function(list){
				list.push(scope.currentClimb);
				User.save(User.user).then(
					function(response){
						console.log('Climb added to list:');
						console.log(User.user);
						console.log(response);
					},
					function(err) {
						console.error('Error adding climb to list: '+ err);
					}
				);
			};

			// Remove climb from list

			// Delete list

		}
	}
}]);