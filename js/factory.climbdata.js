
app.factory('ClimbData', ["FIREBASE_URL", "$firebaseArray", 
	function(FIREBASE_URL, $firebaseArray){

	// Get data
	var ref = new Firebase(FIREBASE_URL + '/data');
	var data = $firebaseArray(ref);

	return data; // returns a promise for the data. Use $loaded method
}]);
