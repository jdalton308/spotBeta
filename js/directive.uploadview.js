app.directive('jdUploadView', ['ClimbData', 'SpotData', 'Places', function(ClimbData, SpotData, Places){
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


			// Form Data Initialization
			//-------------------------------
			scope.newClimb = {};

			// These are just for reference
			scope.newClimb.newOrOld = 'old';
			scope.newClimb.newLocation = {};

			scope.validateClimbGrade = function(input){
				// TODO: disable the grade input until type is chosen
				if (scope.newClimb.climbType == 'roped') {
					// Confirm whole string is <5 characters (5.15a == 5 characters)
					// If input == xx+letter,
						// ensure that xx < 16
						// and letter == a,b,c, or d,
						// then add '5.' to front
					// If input == xx,
						// ensure that xx <= 9,
						// if 9 < xx < 16, prompt for a letter grade
						// then add '5.' to front

					// Then convert letter grade to decimal
				} else {

				}
			};

			scope.setGradeOptions = function(){
				if (scope.newClimb.climbType == 'boulder') {
					scope.gradeOptions = [
						{number: 0, fullGrade: 'V0'},
						{number: 1, fullGrade: 'V1'},
						{number: 2, fullGrade: 'V2'},
						{number: 3, fullGrade: 'V3'},
						{number: 4, fullGrade: 'V4'},
						{number: 5, fullGrade: 'V5'},
						{number: 6, fullGrade: 'V6'},
						{number: 7, fullGrade: 'V7'},
						{number: 8, fullGrade: 'V8'},
						{number: 9, fullGrade: 'V9'},
						{number: 10, fullGrade: 'V10'},
						{number: 11, fullGrade: 'V11'},
						{number: 12, fullGrade: 'V12'},
						{number: 13, fullGrade: 'V13'},
						{number: 14, fullGrade: 'V14'},
						{number: 15, fullGrade: 'V15'},
						{number: 16, fullGrade: 'V16'}
					];
				} else {
					scope.gradeOptions = [
						{number: 6, fullGrade: '5.6'},
						{number: 7, fullGrade: '5.7'},
						{number: 8, fullGrade: '5.8'},
						{number: 9, fullGrade: '5.9'},
						{number: 10, fullGrade: '5.10'}
					];
				}
			};


			// Submit
			//--------------------------
			scope.createNewClimb = function() {

				// TODO: Process the grade
				// // if boulder, unsure only number
				// // if roped, create grade conversion and translated grade
				if (scope.newClimb.climbType == 'roped') {
					// strip of 
				}

				console.log('Upload Form:');
				console.log(scope.uploadForm);

				var climbObj = {
					description: scope.newClimb.climbDescription,
					grade: parseInt(scope.newClimb.climbGrade), //if type == boulder
					height: scope.newClimb.climbHeight,
					name: scope.newClimb.climbName,
					rating: parseInt(scope.newClimb.climbRating),
					type: scope.newClimb.climbType,
					subtype: scope.newClimb.climbSubType
				};

				console.log('New Climb Obj:');
				console.log(climbObj);

				// If adding to existing climb
				//-------------------------------
				if (scope.newClimb.newOrOld == 'old') {

					var targetSpot = scope.climbData[scope.newClimb.climbLocation];
					var targetId = targetSpot.$id;
					// console.log('Target Spot:');
					// console.log(targetSpot);

					// 1) Retrieve the climb array as a firebaseArray
					SpotData.get(targetId).$loaded(
						function(data){
							console.log('Climbs within desired spot recieved as FirebaseArray:');
							console.log(data);

							// 2) Push new climb to firebase
							data.$add(climbObj);
						},
						function(err){
							console.error('ERROR: Could not retrieve sibling climbs. '+ err);
						}
					);


				// If creating a new spot
				//---------------------------------
				} else {

					// 1) Get location details
					var newSpotLatLng = new google.maps.LatLng(scope.newClimb.newLocation.latitude, scope.newClimb.newLocation.longitude);

					Places.geocode(newSpotLatLng).then(
						function(results){
							console.log('New location details recieved: ');
							console.log(results);

							var findSpotDetails = function(results_array){
								for (var i = 0; i < results_array.length; i++) {
									var result = results_array[i];
									for (var h = 0; h < result.types.length; h++) {
										console.log('Type: '+ result.types[h])
										if (result.types[h] == 'postal_code') {
											scope.newClimb.newLocation.details = result;
											return true;
										}
									}
								}
								console.error('ERROR: Could not find "postal_code" of the new location.');
								return false;
							};

							var findSpotState = function(address_components) {
								for (var i = 0; i < address_components.length; i++) {
									var component = address_components[i];
									for (var h = 0; h < component.types.length; h++) {
										console.log('Type: '+ component.types[h])
										if (component.types[h] == 'administrative_area_level_1') {
											scope.newClimb.newLocation.details['state_code'] = component.short_name;
											scope.newClimb.newLocation.details['state_name'] = component.long_name;
											return true;
										}
									}
								}
								console.error('ERROR: New Spot does not have a state associated with it.');
								return false
							};

							// get and format spot info
							if (findSpotDetails(results)) {
								findSpotState(scope.newClimb.newLocation.details.address_components);
								console.log('New Location details updated. New Climb:');
								console.log(scope.newClimb);
							}

							// 2) Construct location object without climb added
							var newSpotObj = {
								climbs: [],
								location: {
									lat: scope.newClimb.newLocation.latitude,
									long: scope.newClimb.newLocation.longitude,
									state_name: scope.newClimb.newLocation.details.state_name,
									state_code: scope.newClimb.newLocation.details.state_code
								},
								name: scope.newClimb.newLocation.name,
								details: scope.newClimb.newLocation.details
							}

							console.log('Structured new climbing spot without climb:');
							console.log(newSpotObj);

							// 3) Save new spot
							ClimbData.$add(newSpotObj).then(
								function(ref){
									//TODO: get id of ref, then call SpotData.get(id), then $add the climbObj
									console.log(newSpotObj.name +' added to database. Adding climb to spot...');
									var id = ref.key();

									// 4) Add climb to spot
									SpotData.get(id).$loaded(
										function(data){
											data.$add(climbObj).then(
												function(ref){
													console.log(climbObj.name +' successfully added to '+ newSpotObj.name);

													// TODO:
														// Show success/thanks message but stay in upload (once it is it's own route)
														// Reset the upload route form to empty
												},
												function(err){
													console.error('ERROR: Error adding '+ climbObj.name +' to '+ newSpotObj.name);
												}
											);
										},
										function(err){
											console.error('ERROR: Error retrieving the new location\'s climb data: '+ err);
										}
									);
								},
								function(err){

								}
							);

							console.log('Updated climbData:');
							console.log(scope.climbData);


						},
						function(err){
							console.error('Error retrieving new location details before saving the climb to the database: '+ err);
						}
					);
				}
			};

			scope.showPreview = true;

		}
	};
}]);