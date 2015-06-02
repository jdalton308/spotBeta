
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

	$scope.currentSearch = Places.currentSearch;

	$scope.predictions = false;

	$scope.latSearch = false;
	$scope.latInvalid = true;

	var getGeocode = function(query) {
		Places.geocode(query)
			.then(function(results){
				console.log('Place details recieved:');
				console.log(results);

				Places.currentSearch = results[0]; //results is an array

				var lat = Places.currentSearch.geometry.location.A; //37
				var long = Places.currentSearch.geometry.location.F; //122

				$location.path('/app').search({latitude: lat, longitude: long});

			}, function(error) {
				console.error(error);
				Places.currentSearch = false;
			});
	}

	// USER GEOLOCATION
	//-----------------
	if (Places.userLocation) {
		$scope.canUseLocation = true;
	} else {
		Places.setUserLocation()
			.then(function(){
				$scope.canUseLocation = true;
			}, function(){
				$scope.canUseLocation = false;
			});
	}

	$scope.useCurrentLocation = function() {
		getGeocode(Places.userLocation);
	}

	// SEARCH BY PLACE or LAT/LNG
	//----------------------------
	$scope.inputKeyup = function(query) {
		if ($scope.latSearch) {
			// perform validation on lat,lng

			var latLng = [];
			var numbers = query.split(',');

			// check if two numbers
			if (numbers.length != 2) {
				// console.error('Please enter two numbers seperated by a comma for searching by latitude and longitude');
				$scope.errorMessage = "Please enter two numbers seperated by a comma for searching by latitude and longitude";
				$scope.latInvalid = true;
				return
			}

			// check if strings are numbers
			for (var i = 0; i < numbers.length; i++) {
				var number = numbers[i].trim();
				var thisFloat = parseFloat(number);

				if (isNaN(thisFloat)) {
					// console.error('Please enter only numbers for latitude and longitude search');
					$scope.errorMessage = "Please enter only numbers for latitude and longitude search";
					$scope.latInvalid = true;
					return;
				} else {
					latLng.push(thisFloat);
				}
			}

			// Since made it to the end, input is valid. Set the view appropriately
			$scope.errorMessage = false;
			$scope.latInvalid = false;
			$scope.latLgnQuery = latLng;

		} else {
			Places.autocomplete(query)
				.then(function(predictions){
					// console.log('Autocomplete returned:');
					// console.log(predictions);

					$scope.predictions = predictions;

				}, function(err){
					console.error(err);
					$scope.predictions = false;
				});
		}
	};

	$scope.showMap = function(input) {

		var query;

		if ($scope.latSearch) {
			// use lat/lng
			var lat = $scope.latLgnQuery[0];
			var lng = $scope.latLgnQuery[1];
			query = new google.maps.LatLng(lat, lng);
		} else {
			// use autocomplete object
			query = input.description;
		}
		// console.log('Query: ');
		// console.log(query);

		getGeocode(query);
	};


}]);


















