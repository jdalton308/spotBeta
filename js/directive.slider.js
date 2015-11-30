
app.directive('jdSlider', ['$document', function($document){
	return {
		restrict: 'E',
		templateUrl: 'js/directives/slider.html',
		require: '^jdMapFilter',
		scope: {
			filter: '='
		},
		link: function(scope, element, attr, mapCtrl) {

			// Initialize
			//=====================
			var fullWidth = angular.element('.slider-container').width();
			var ropedGradeList;
			var heightList;
			scope.currentMinPos = 0;
			scope.currentMaxPos = fullWidth;
			scope.currentSlider = null;
			scope.lastMaxIndex;
			scope.lastMinIndex;

			if (attr.type == 'boulder') {

				var gradeWidth = fullWidth/16;
				scope.currentMin = 0;
				scope.currentMax = 16;
				scope.currentMinIndex = 0;
				scope.currentMaxIndex = 16;

			} else if (attr.type == 'roped') {

				ropedGradeList = scope.filter.grade.roped.grades;
				var listLength = Object.keys(ropedGradeList).length;
				var gradeWidth = fullWidth/(listLength-1);

				scope.currentMin = ropedGradeList[0].grade;
				scope.currentMax = ropedGradeList[listLength-1].grade;
				scope.currentMinIndex = 0;
				scope.currentMaxIndex = listLength-1;

			} else if (attr.type == 'height') {

				heightList = scope.filter.height.values;
				var listLength = Object.keys(heightList).length;
				var gradeWidth = fullWidth/(listLength-1);

				scope.currentMin = heightList[0].height.toString() + '\'';
				scope.currentMax = heightList[listLength-1].height.toString() + '\'';
				scope.currentMinIndex = 0;
				scope.currentMaxIndex = listLength-1;

			} else {
				console.error('Please enter a valid "type" attribute for the slider');
				return;
			}


			// Click behaviors
			//=====================
			var elStartPos;
			var clickedEl;
			var clickDownPos = 0;

			scope.startMove = function(id, event) {
				scope.currentSlider = id;

				// Get current element
				clickedEl = element.find('#slider-'+id);
				elStartPos = parseInt( clickedEl.css('left'), 10);

				// Get initial mouse pos
				clickDownPos = event.pageX;

				// Set inital index
				scope.lastMaxIndex = angular.copy(scope.currentMaxIndex);
				scope.lastMinIndex = angular.copy(scope.currentMinIndex);

				// Set-up drag behavior
				$document.on('mousemove', moveMarker);
				$document.on('mouseup', stopMarker);
			}

			var moveMarker = function(e) {
				var mousePos = e.pageX;
				var movedDist = mousePos - clickDownPos;
				var elPos = elStartPos + movedDist;
				var newElPos;

				if (scope.currentSlider == 'min') {

					newElPos = (elPos > scope.currentMaxPos) ? scope.currentMaxPos :
									(elPos < 0) ? 0 : elPos;

					var newIndex = Math.round(newElPos/gradeWidth);

					if (attr.type == 'roped') {
						newGrade = ropedGradeList[newIndex].grade;
					} else if ( attr.type == 'height') {
						newGrade = heightList[newIndex].height.toString() + '\'';
					} else {
						newGrade = newIndex;
					}

					scope.$apply( scope.currentMin = newGrade );
					scope.currentMinIndex = newIndex;
					scope.currentMinPos = newElPos;
					// console.log('Updated currentMin: '+ scope.currentMin);
				} else {

					newElPos = (elPos > fullWidth) ? fullWidth :
									(elPos < scope.currentMinPos) ? scope.currentMinPos : elPos;

					var newIndex = Math.round(newElPos/gradeWidth);

					if (attr.type == 'roped') {
						newGrade = ropedGradeList[newIndex].grade;
					} else if ( attr.type == 'height') {
						newGrade = heightList[newIndex].height.toString() + '\'';
					} else {
						newGrade = newIndex;
					}

					scope.$apply( scope.currentMax = newGrade );
					scope.currentMaxIndex = newIndex;
					scope.currentMaxPos = newElPos;
					// console.log('Updated currentMax: '+ scope.currentMax);
				}

				clickedEl.css('left', newElPos);
			}

			var stopMarker = function(e) {
				$document.off('mousemove', moveMarker);
				$document.off('mouseup', stopMarker);

				var finalPos;

				if (scope.currentSlider == 'min') {
					finalPos = scope.currentMinIndex * gradeWidth;
				} else {
					finalPos = scope.currentMaxIndex * gradeWidth;
				}

				clickedEl.css('left', finalPos);
				scope.clickedEl = null;
				scope.currentSlider = null;

				// Test if values actually changed
				if (scope.currentMaxIndex == scope.lastMaxIndex && scope.currentMinIndex == scope.lastMinIndex) {
					console.log('...Slider values remained the same...')
					return;
				} else {
					// Call the filter function to update map
					if (attr.type == 'roped') {
						mapCtrl.filterRopedGrade( ropedGradeList[scope.currentMinIndex].conversion, ropedGradeList[scope.currentMaxIndex].conversion );
					} else if ( attr.type == 'height') {
						mapCtrl.filterHeight( heightList[scope.currentMinIndex].height, heightList[scope.currentMaxIndex].height);
					} else {
						mapCtrl.filterBoulderGrade(scope.currentMinIndex, scope.currentMaxIndex);
					}
				}

				// update the filter list
				scope.$apply();
			}
		}
	}
}]);