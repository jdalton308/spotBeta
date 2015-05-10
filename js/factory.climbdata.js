
app.factory('ClimbData', ["FIREBASE_URL", "$firebaseObject", 
	function(FIREBASE_URL, $firebaseObject){

	// Get data
	var ref = new Firebase(FIREBASE_URL + '/data');
	var data = $firebaseObject(ref);

	return data;
}]);
