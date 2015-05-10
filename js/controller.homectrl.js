
// USING APPCONTROLLER INSTEAD

// app.controller('homeController', ['$scope', '$location', 'Auth', 'User', 
// 	function($scope, $location, Auth, User){

// 	// USER AUTHENTICATION

// 	$scope.signedIn = Auth.signedIn;
// 	$scope.logout = Auth.logout;
// 	$scope.user = Auth.user;
// 	$scope.oldUser = {};

// 	// if (Auth.signedIn) {
// 	// 	$location.path('/');
// 	// }

// 	$scope.login = function() {
// 		Auth.login($scope.oldUser).then(function(profileData){
// 			console.log('User Logged In:');
// 			console.log(profileData);

// 			$location.path('/app');
// 			$scope.hideAuth();

// 		}, function(error) {
// 			$scope.error = error.toString();
// 		});
// 	}

// 	$scope.register = function() {
// 		Auth.register($scope.user).then(function(userData){
// 			console.log('User Created:');
// 			console.log(userData);

// 			Auth.login($scope.user).then(function(){
// 				$location.path('/app');
// 			});
			
// 		}, function(error) {
// 			$scope.error = error.toString();
// 		});
// 	}


// 	// Show/Hide Login and Signup forms in menu bar
// 	$scope.signupShowing = false;
// 	$scope.loginShowing = false;

// 	$scope.showLogin = function() {
// 		$scope.signupShowing = false;
// 		$scope.loginShowing = !$scope.loginShowing;
// 	}
// 	$scope.showSignup = function() {
// 		$scope.signupShowing = !$scope.signupShowing;
// 		$scope.loginShowing = false;
// 	}
// 	$scope.hideAuth = function() {
// 		$scope.signupShowing = false;
// 		$scope.loginShowing = false;
// 	}


// }]);