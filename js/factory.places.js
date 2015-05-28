
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