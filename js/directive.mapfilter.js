
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

				// Close infobox, if open
				// infoWindow.close();

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
				

					// If included routes, create new marker for each location
					if (val.included) {
						// console.log('Spot included');

						if (scope.markers[key]) {
							// Close infobox, if open
							infoWindow.close();
							// TODO: Test if current infoWindow.content = last boxContent. If so, update the infowindow content, then reshow the infowindow on the marker

							// console.log('Marker exists');
							// marker exists, so just update info box
							scope.markers[key].boxContent = boxContent;


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

								console.log('Marker:');
								console.log(marker);
							});

							scope.markers[key] = marker;
						}

					} else {
						// Destroy the marker, infobox, and click-event listner
						// console.log('Deleting...')
						// console.log(scope.markers[key]);

						scope.markers[key].setMap(null);
						scope.markers[key] = null;
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

			// scope.boulderGrades = [
			// 	0, 1, 2, 3, 4, 5, 6, 7, 8 ,9, 10, 11, 12, 13, 14, 15, 16
			// ];

			// Filter the markers on clicks

			// initialize the 
			scope.filter = {
				type: {
					roped: true,
					sport: true,
					trad: true,
					topRope: true,
					boulder: true
				},
				grade: {
					boulder: {
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
			}

			scope.filterType = function(type) {

				console.log(scope.filter);

				angular.forEach(filteredData, function(value, key){
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

				drawMarkers(filteredData);
			}

			scope.filterBoulderGrade = function(grade) {

				console.log(scope.filter);

				angular.forEach(filteredData, function(value, key){
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

				drawMarkers(filteredData);
			}

		}
	}
}]);