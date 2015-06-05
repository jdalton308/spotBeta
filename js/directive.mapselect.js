app.directive('jdMapSelect', [ function(){
	return {
		restrict: 'E',
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