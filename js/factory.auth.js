
app.factory('Auth', ["$firebaseAuth", '$firebaseObject', "FIREBASE_URL", 'User', function($firebaseAuth, $firebaseObject, FIREBASE_URL, User) {

	var ref = new Firebase(FIREBASE_URL);
	var auth = $firebaseAuth(ref);

	var Auth = {
		register: function(user) {
			return auth.$createUser(user).then(
				function(userData){
					// Create user profile in database
					newUser = {};
					newUser.uid = userData.uid;
					newUser.info = {
						email: userData.password.email
					};
					newUser.lists = {};

					return User.add(newUser);

					// .then(
					// 	function(response){
					// 		console.log('User profile created');
					// 		console.log(response);
					// 	},
					// 	function(err){
					// 		console.error('Error creating user profile: '+ err);
					// 	}
					// );

				}, function(err){
					console.error('Error registering new user: '+ err);
				});

		},
		login: function(user) {
			return auth.$authWithPassword(user).then(
				function(response){
					console.log('Logged-in. Fetching profile. First response:');
					console.log(response);

					// Get user profile
					ref = new Firebase(FIREBASE_URL + '/users/' + response.uid);
					userObj = $firebaseObject(ref);
					return userObj;//use $loaded() to use returned promise
				},
				function(err) {
					console.error('Error retrieving user profile:' + err);
				}
			);			
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
		updatePassword: function(obj) {
			return auth.$changePassword(obj); // return promise
		},
		updateEmail: function(obj) {
			return auth.$changeEmail(obj); // return promise
		},
		deleteUser: function(obj) {
			return auth.$removeUser(obj); // return promise
		},
		user: {}
	};

	auth.$onAuth( function(user) {
		if (user) {
			// logged in...
			console.log('logged in');
			angular.copy(user, Auth.user);

			if (!User.uid) {
				console.log('-Fetching profile');
				console.log(Auth.user.uid);
				User.get(Auth.user.uid).$loaded(function(profileData){
					console.log('--Profile retrieved:');
					console.log(profileData);
				});

			} else {
				console.log('Profile already loaded');
				console.log(User.user());
			}
		} else {
			// logged out...
			console.log('logged out');
			angular.copy({}, Auth.user);
		}
	});

	return Auth;
}]);

