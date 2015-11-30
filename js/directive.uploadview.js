app.directive('jdUploadView', ['ClimbData', 'SpotData', 'Places', function(ClimbData, SpotData, Places){
	return {
		restrict: 'E',
		templateUrl: 'js/directives/uploadView.html',
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
						{number: 10.1, fullGrade: '5.10a'},
						{number: 10.2, fullGrade: '5.10b'},
						{number: 10.3, fullGrade: '5.10c'},
						{number: 10.4, fullGrade: '5.10d'},
						{number: 11.1, fullGrade: '5.11a'},
						{number: 11.2, fullGrade: '5.11b'},
						{number: 11.3, fullGrade: '5.11c'},
						{number: 11.4, fullGrade: '5.11d'},
						{number: 12.1, fullGrade: '5.12a'},
						{number: 12.2, fullGrade: '5.12b'},
						{number: 12.3, fullGrade: '5.12c'},
						{number: 12.4, fullGrade: '5.12d'},
						{number: 13.1, fullGrade: '5.13a'},
						{number: 13.2, fullGrade: '5.13b'},
						{number: 13.3, fullGrade: '5.13c'},
						{number: 13.4, fullGrade: '5.13d'},
						{number: 14.1, fullGrade: '5.14a'},
						{number: 14.2, fullGrade: '5.14b'},
						{number: 14.3, fullGrade: '5.14c'},
						{number: 14.4, fullGrade: '5.14d'},
						{number: 15.1, fullGrade: '5.15a'},
						{number: 15.2, fullGrade: '5.15b'},
						{number: 15.3, fullGrade: '5.15c'},
						{number: 15.4, fullGrade: '5.15d'},
					];
				}
			};


			// Submit
			//--------------------------
			scope.createNewClimb = function() {

				console.log('Upload Form:');
				console.log(scope.uploadForm);

				var setGrade = function(climbGrade, climbType) {
					if (climbType == 'boulder') {
						return parseInt(climbGrade);
					} else {
						// console.log('Original climbGrade: ');
						// console.log(climbGrade);
						var gradeObj = {};

						if (climbGrade.number > 9) {
							var shortGrade = climbGrade.fullGrade.split('.')[1];

							gradeObj = {
								grade: shortGrade,
								conversion: climbGrade.number
							}

						} else {
							gradeObj = {
								grade: gradeInt,
								conversion: gradeInt
							}
						}
						return gradeObj;
					}
				}

				var climbObj = {
					description: scope.newClimb.climbDescription,
					grade: setGrade(scope.newClimb.climbGrade, scope.newClimb.climbType),
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
					console.log('Target Spot:');
					console.log(targetSpot);

					// 1) Retrieve the climb array as a firebaseArray
					SpotData.get(targetId).$loaded(
						function(data){
							console.log('Climbs within desired spot recieved as FirebaseArray:');
							console.log(data);

							// 2) Push new climb to firebase
							data.$add(climbObj).then(
								function(ref){
									console.log(climbObj.name +' successfully added to '+ targetSpot.name)
								}
							);
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