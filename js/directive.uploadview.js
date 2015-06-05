app.directive('jdUploadView', ['ClimbData', function(ClimbData){
	return {
		restrict: 'E',
		templateUrl: 'directives/uploadView.html',
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

				// TODO: Process the grade
				// // if boulder, unsure only number
				// // if roped, create grade conversion and translated grade

				console.log('Upload Form:');
				console.log(scope.uploadForm);

				// console.log('New Climb:');
				// console.log(scope.newClimb);

				if (scope.newClimb.newOrOld == 'old') {
					var targetSpot = scope.climbData[scope.newClimb.climbLocation];
					// console.log('Target Spot:');
					// console.log(targetSpot);

					var climbObj = {
						description: scope.newClimb.climbDescription,
						grade: parseInt(scope.newClimb.climbGrade), //if type == boulder
						height: scope.newClimb.climbHeight,
						name: scope.newClimb.climbName,
						rating: parseInt(scope.newClimb.climbRating),
						type: scope.newClimb.climbType
					};

					console.log('New Climb Obj:');
					console.log(climbObj);

					targetSpot.climbs.push(climbObj);
					console.log('New Target Spot:');
					console.log(targetSpot);

					scope.climbData.$save().then(
						function(data){
							console.log('Climb successfully added to database');
							console.log('New Data:')
							console.log(data);
						},
						function(err){
							console.error('Error adding new climb to database. '+ err);
						}
					);
				}
			};

			scope.showPreview = true;

		}
	};
}]);