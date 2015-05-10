
app.controller('appController', ['$scope', '$location', "FIREBASE_URL", 'Auth', 'ClimbData', 'User', 
	function($scope, $location, FIREBASE_URL, Auth, ClimbData, User){


	// User creation and authentication
	//==============================

	$scope.signedIn = Auth.signedIn;
	$scope.logout = Auth.logout;
	$scope.user = Auth.user;
	$scope.oldUser = {};

	$scope.login = function() {
		Auth.login($scope.oldUser).then(function(profileData){

			console.log('Profile recieved:');
			console.log(profileData);

			$location.path('/app');
			$scope.hideAuth();

		}, function(error) {
			$scope.error = error.toString();
		});
	}

	$scope.register = function() {
		Auth.register($scope.user).then(function(userData){
			console.log('User Created:');
			console.log(userData);


			// Create user profile in database
			// newUser = {};
			// newUser.uid = userData.uid;
			// newUser.info = {
			// 	email: userData.password.email
			// };
			// newUser.lists = {};

			// User.add(newUser).then(
			// 	function(response){
			// 		console.log('User profile created');
			// 		console.log(response);
			// 	},
			// 	function(err){
			// 		console.error('Error creating user profile: '+ err);
			// 	}
			// );


			Auth.login($scope.user).then(function(){
				$location.path('/app');
			});
		}, function(error) {
			$scope.error = error.toString();
		});
	}


	// User Profile
	//================================

	// $scope.userProfile = User.user;



	// Show/Hide Login and Signup forms in menu bar
	//======================================
	$scope.signupShowing = false;
	$scope.loginShowing = false;

	$scope.showLogin = function() {
		$scope.signupShowing = false;
		$scope.loginShowing = !$scope.loginShowing;
	};
	$scope.showSignup = function() {
		$scope.signupShowing = !$scope.signupShowing;
		$scope.loginShowing = false;
	};
	$scope.hideAuth = function() {
		$scope.signupShowing = false;
		$scope.loginShowing = false;
	};



	// Location data
	$scope.searchResult = {
		name: 'Berkeley',
		lat: 37.8717,
		lng: -122.2728
	}

}]);

