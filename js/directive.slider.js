
app.directive('jdSlider', ['$document', function($document){
	return {
		restrict: 'E',
		templateUrl: 'directives/slider.html',
		link: function(scope, element, attributes) {
			
			var fullWidth = angular.element('.slider-container').width();
			var gradeWidth = fullWidth/16;
			console.log('gradeWidth: '+ gradeWidth);
			var gradePerc = 1/16*100;

			// Initialize
			scope.currentMin = 0;
			scope.currentMax = 16;
			scope.currentMinPos = 0;
			scope.currentMaxPos = fullWidth;
			scope.currentSlider = null;

			var elStartPos;
			var clickedEl;
			var clickDownPos = 0;


			scope.startMove = function(id, event) {
				scope.currentSlider = id;

				// Get current element
				clickedEl = angular.element('#slider-'+id);
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

					var newGrade = Math.round(newElPos/gradeWidth);
					scope.$apply( scope.currentMin = newGrade );
					scope.currentMinPos = newElPos;
					console.log('Updated currentMin: '+ scope.currentMin);
				} else {

					newElPos = (elPos > fullWidth) ? fullWidth : 
									(elPos < scope.currentMinPos) ? scope.currentMinPos : elPos;

					var newGrade = Math.round(newElPos/gradeWidth);
					scope.$apply( scope.currentMax = newGrade );
					scope.currentMaxPos = newElPos;
					console.log('Updated currentMax: '+ scope.currentMax);
				}

				clickedEl.css('left', newElPos);
			}

			var stopMarker = function(e) {				
				$document.off('mousemove', moveMarker);
				$document.off('mouseup', stopMarker);

				scope.clickedEl = null;
				scope.currentSlider = null;
			}
		}
	}
}]);