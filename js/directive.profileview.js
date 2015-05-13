
app.directive('jdProfileView', ['User', function(User){
	return {
		restrict: 'E',
		templateUrl: "directives/profileView.html",
		link: function(scope, element, attributes) {

			scope.userProfile = User.user();
			console.log('User Profile (User.user):');
			console.log(scope.userProfile);

			// SHOW/HIDE CONTROLS
			//==================================
			scope.showProfile = false;

			scope.updatePassForm = false;
			scope.updateEmailForm = false;
			scope.deleteUserForm = false;

			scope.toggleProfile = function(){
				scope.showProfile = !scope.showProfile;
			};
			scope.showUpdatePass = function(){
				scope.updatePassForm = true;
				scope.updateEmailForm = false;
				scope.deleteUserForm = false;
			};
			scope.showUpdateEmail = function(){
				scope.updatePassForm = false;
				scope.updateEmailForm = true;
				scope.deleteUserForm = false;
			};
			scope.showDeleteUser = function(){
				scope.updatePassForm = false;
				scope.updateEmailForm = false;
				scope.deleteUserForm = true;
			};


			// UPDATE PROFILE
			//=================================

			scope.tempEmailUpdate = {
				newEmail: '',
				oldEmail: '',
				pass: ''
			};
			scope.tempPassUpdate = {
				email: '',
				oldPass: '',
				newPass: ''
			};
			scope.deleteUserObj = {
				email: '',
				pass: ''
			}

			scope.saveProfile = function() {

				User.save(scope.userProfile).then(
					function(response) {
						console.log('Profile saved');
						console.log(response);
					},
					function(err) {
						console.error('Error saving user profile: '+ err);
					}
				);
			};

			scope.updatePassword = function() {
				Auth.updatePassword(scope.tempPassUpdate).then(
					function(response) {
						console.log('Password updated');
						console.log(response);
					},
					function(err) {
						console.error('Error updating password: '+ err);
					}
				);
			};

			scope.updateEmail = function() {
				Auth.updateEmail(scope.tempEmailUpdate).then(
					function(response) {
						console.log('Email updated');
						console.log(response);
					},
					function(err) {
						console.error('Error updating email: '+ err);
					}
				);				
			};

			scope.deleteAccount = function() {
				Auth.deleteUser(scope.deleteObj).then(
					function(response) {
						console.log('User deleted');
						console.log(response);

						// Also remove from user data
					},
					function(err) {
						console.error('Error deleting user: '+ err);
					}
				);	

			};

		}
	}
}]);