
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
		geocode: function(address) {

			if (address != "") {

				return $q(function(resolve, reject){
					geocoder.geocode( { 'address': address}, function(result, status) {
						if (status != google.maps.GeocoderStatus.OK) {
							reject('Error retrieving place coordinates: '+ status);	
						} else {
							resolve(result);
						}
					});
				});
			}
		}, //end geocode
		currentSearch: false // store geocode result here to use with map
	}

	return places;
}]);