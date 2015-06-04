app.directive('jdUploadView', ['ClimbData', function(ClimbData){
	return {
		restrict: 'E',
		templateUrl: 'directives/uploadView.html',
		controller: function(){

		},
		link: function(scope, element, attributes) {

			// Attach climb data to scope
			//--------------------------------
			ClimbData.$loaded(function(data){
				scope.climbData = data;
				console.log('ClimbData in Upload View');
				console.log(scope.climbData);
			});

			// Form Data
			//-------------------------------
			scope.newClimb = {};
			scope.newClimb.climbName;
			scope.newClimb.climbLocation;
			scope.newClimb.climbGrade;
			scope.newClimb.climbType;
			scope.newClimb.climbSubtype;
			scope.newClimb.climbHeight;
			scope.newClimb.climbRating;
			scope.newClimb.climbDescription;


			// Submit
			//--------------------------
			scope.createNewClimb = function(form) {
				console.log('Upload Form:');
				console.log(scope.uploadForm);
			};

			scope.showPreview = true;

		}
	};
}]);