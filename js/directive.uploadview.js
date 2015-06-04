app.directive('jdUploadView', ['ClimbData', function(ClimbData){
	return {
		restrict: 'E',
		templateUrl: 'directives/uploadView.html',
		// controller: function($scope){

		// 	// Attach climb data to scope
		// 	//--------------------------------
		// 	ClimbData.$loaded(function(data){
		// 		$scope.climbData = data;
		// 		console.log('ClimbData in Upload View');
		// 		console.log($scope.climbData);
		// 	});

		// 	// Form Data
		// 	//-------------------------------
		// 	$scope.newClimb = {};

		// 	// These are just for reference
		// 	$scope.newClimb['newLocation'] = {};

		// },
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

			// These are just for reference
			scope.newClimb.newLocation = {};

			// Submit
			//--------------------------
			scope.createNewClimb = function() {
				console.log('Upload Form:');
				console.log(scope.uploadForm);
			};

			scope.showPreview = true;

		}
	};
}]);