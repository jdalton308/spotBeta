
app.controller('appController', ['$scope', '$location', '$timeout', "FIREBASE_URL", 'Auth', 'ClimbData', 'User', 'Places',
	function($scope, $location, $timeout, FIREBASE_URL, Auth, ClimbData, User, Places){


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

	// Other views
	$scope.showProfile = false;
	$scope.showLists = false;

	$scope.toggleProfile = function(){
		$scope.showProfile = !$scope.showProfile;
		$scope.showLists = false;
	};
	$scope.toggleLists = function() {
		$scope.showLists = !$scope.showLists;
		$scope.showProfile = false;
	};



	// LOCATION SEARCHING
	//===============================

	// Demo Location data
	$scope.searchResult = {
		name: 'Berkeley',
		lat: 37.8717,
		lng: -122.2728
	};

	$scope.latSearch = false;
	$scope.toggleLatSearch = function() {
		$scope.latSearch = !$scope.latSearch;
	}

	$scope.predictions = false;
	$scope.latInvalid = true;

	$scope.autocomplete = function(query) {
		if ($scope.latSearch) {
			// perform validation on lat,lng
			// - set timeout
			// - divide string at comma
			// - trim white space
			// - ensure only integer or float
			// - enable submit btn

		} else {
			Places.autocomplete(query)
				.then(function(predictions){
					console.log('Autocomplete returned:');
					console.log(predictions);

					$scope.predictions = predictions;

				}, function(err){
					console.error(err);
					$scope.predictions = false;
				});
		}
	};

	$scope.showMap = function(cityObj) {
		console.log(cityObj);

		Places.geocode(cityObj.description)
			.then(function(results){
				console.log('Place details recieved:');
				console.log(results);

				Places.currentSearch = results[0]; //results is an array

				$location.path('/app');

			}, function(error) {
				console.error(error);
				Places.currentSearch = false;
			});
	};

	$scope.findLat = function(query) {
		// break into two numbers
		// set as LatLng object for google maps
		// set as Places.currentSearch object
		// change $loaction
	}

}]);

