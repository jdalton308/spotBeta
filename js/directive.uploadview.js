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

			// Form Data
			//-------------------------------
			scope.newClimb = {};

			// These are just for reference
			scope.newClimb.newOrOld = 'old';
			scope.newClimb.newLocation = {};

			// Submit
			//--------------------------
			scope.createNewClimb = function() {

				// TODO: Process the grade
				// // if boulder, unsure only number
				// // if roped, create grade conversion and translated grade

				console.log('Upload Form:');
				console.log(scope.uploadForm);

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

				// IF ADDING TO EXISTING CLIMB
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


				// IF CREATING A NEW SPOT
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