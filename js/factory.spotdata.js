
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
