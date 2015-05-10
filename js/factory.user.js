
app.factory('User', ['$firebaseObject', 'FIREBASE_URL', 
	function($firebaseObject, FIREBASE_URL){

	var ref;
	var userObj;

	// Get user
	var user = {
		get: function(uid) {
			ref = new Firebase(FIREBASE_URL + '/users/' + uid);
			userObj = $firebaseObject(ref);
			return userObj;//use $loaded() to use returned promise
		},
		add: function(newUser) {
			// push to users obj and save
			ref = new Firebase(FIREBASE_URL + '/users');
			userObj = $firebaseObject(ref);

			usersObj[newUser.uid] = newUser;
			return usersObj.$save(); // returns promise
		},
		save: function(obj) {
			return obj.$save; // returns promise. Obj is firebase object
		},
		user: function(){
			return userObj;
		}
	}

	return user;
}]);