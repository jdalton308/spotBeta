
app.factory('Auth', ["$firebaseAuth", "FIREBASE_URL", "$rootScope", function($firebaseAuth, FIREBASE_URL, $rootScope) {
	var ref = new Firebase(FIREBASE_URL);
	var auth = $firebaseAuth(ref);

	var Auth = {
		register: function(user) {
			return auth.$createUser(user);
		},
		login: function(user) {
			return auth.$authWithPassword(user);
		},
		logout: function() {
			auth.$unauth();
		},
		resolveUser: function() {
			return auth.$getCurrentUser();
		},
		signedIn: function() {
			return !!Auth.user.provider;
		},
		user: {}
	};

	auth.$onAuth( function(user) {
		if (user) {
			// logged in...
			console.log('logged in');
			angular.copy(user, Auth.user);

			console.log('User:');
			console.log(Auth.user);
		} else {
			// logged out...
			console.log('logged out');
			angular.copy({}, Auth.user);
		}
	});

	return Auth;
}]);

