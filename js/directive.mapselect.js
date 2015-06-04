app.directive('jdMapSelect', [ function(){
	return {
		restrict: 'E',
		// require: '^jdUploadView',
		// scope: {
		// 	newClimb: '=newclimb'
		// },
		templateUrl: 'directives/mapSelect.html',
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
				zoom: 10,
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

			console.log('New Climb Obj:');
			console.log(scope.newClimb);

			console.log('Scope:');
			console.log(scope);


			// EVENTS
			//=====================

			// Add keyup events to lat,lng inputs for when updating manually. => Pan the map and marker

			// Marker Drag
			google.maps.event.addListener(scope.locationMarker, 'drag', function(){
				// update the scope's newLat and newLong
				var markerPos = scope.locationMarker.getPosition();

				console.log('MarkerPos:');
				console.log(markerPos);

				scope.$apply( scope.newClimb.newLocation.latitude = markerPos.lat() );
				scope.$apply( scope.newClimb.newLocation.longitude = markerPos.lng() );

				console.log('New Marker Lat: '+ scope.newClimb.newLocation.latitude);
				// console.log('New Marker Lat: '+ markerPos.lat());
				console.log('New Marker Lng: '+ scope.newClimb.newLocation.longitude);
				// console.log('New Marker Lng: '+ markerPos.lng());
			});

			// Marker Lock and Map Drag
			scope.markerLocked = false;
			scope.toggleMarkerLock = function() {
				scope.markerLocked = !scope.markerLocked;

				if (scope.markerLocked){
					// Bind drag event listeners

					var mapStartLat;
					var mapStartLng;
					var markerStartLat;
					var markerStartLng;

					var dragStart = google.maps.event.addListener(scope.locationMap, 'dragstart', function(){
						var startMapCenter = scope.locationMap.getCenter();
						mapStartLat = startMapCenter.lat();
						mapStartLng = startMapCenter.lng();

						var markerPos = scope.locationMarker.getPosition();
						markerStartLat = markerPos.lat();
						markerStartLng = markerPos.lng();
					});
					var dragMove = google.maps.event.addListener(scope.locationMap, 'drag', function(){
						// Move the marker the same distance as the map
						var newMapCenter = scope.locationMap.getCenter();
						mapNewLat = newMapCenter.lat();
						mapNewLng = newMapCenter.lng();

						var movedLat = mapStartLat - mapNewLat;
						var movedLng = mapStartLng - mapNewLng;

						var newMarkerLat = markerStartLat + movedLat;
						var newMarkerLng = markerStartLng + movedLng;

						// update scope
						scope.newClimb.location.newLat = newMarkerLat;
						scope.newClimb.location.newLng = newMarkerLng;

						console.log('New Marker Lat: '+ newMarkerLat);
						console.log('New Marker Lng: '+ newMarkerLng);

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