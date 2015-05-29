
app.directive('jdSlider', ['$document', function($document){
	return {
		restrict: 'E',
		templateUrl: 'directives/slider.html',
		require: '^jdMapFilter',
		scope: {
			filter: '='
		},
		link: function(scope, element, attr, mapCtrl) {

			// Initialize
			//=====================
			var fullWidth = angular.element('.slider-container').width();
			var ropedGradeList;
			var updateFunc;
			scope.currentMinPos = 0;
			scope.currentMaxPos = fullWidth;
			scope.currentSlider = null;

			if (attr.type == 'boulder') {

				var gradeWidth = fullWidth/16;
				scope.currentMin = 0;
				scope.currentMax = 16;
				scope.currentMinIndex = 0;
				scope.currentMaxIndex = 16;

			} else if (attr.type == 'roped') {

				ropedGradeList = scope.filter.grade.roped.grades;
				// console.log('ropedGradeList:');
				// console.log(ropedGradeList);
				var listLength = Object.keys(ropedGradeList).length;
				// console.log('Length: '+ listLength);

				var gradeWidth = fullWidth/(listLength-1);
				scope.currentMin = ropedGradeList[0].grade;
				scope.currentMax = ropedGradeList[listLength-1].grade;
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

				// Update map and model
				// console.log('Calling...');
				// console.log(updateFunc);
				// updateFunc;

				if (attr.type == 'roped') {
					mapCtrl.filterRopedGrade(scope.currentMinIndex, scope.currentMaxIndex);
				} else {
					mapCtrl.filterBoulderGrade(scope.currentMinIndex, scope.currentMaxIndex);
				}
			}
		}
	}
}]);