
app.directive('jdSlider', [function(){
	return {
		restrict: 'E',
		templateUrl: 'directives/slider.html',
		link: function(scope, element, attributes) {
			
			var fullWidth = element.width();
			var gradeWidth = fullWidth/16;
			var gradePerc = 1/16*100;

			// Initialize
			scope.currentMin = 0;
			scope.currentMax = 16;
			scope.currentSlider = null;

			var lastPos = 0;
			var clickedEl;
			var clickDownPos = 0;
			var clickUpPos = 0;


			scope.startMove = function(id, event) {
				scope.currentSlider = id;
				// Get current element
				clickedEl = angular.element('#slider-'+id);
				console.log('Current clickedEl:');
				console.log(clickedEl);

				// Get initial mouse pos
				console.log('Event object:');
				console.log(event);
				clickDownPos = event.pageX;
				console.log('Started at: '+ clickDownPos);
			}

			scope.moveSlideMarker = function(event) {
				if (scope.currentSlider) {
					console.log('Moving marker');
					// step the markers position
					// get the mouse distan
					var currentMousePos = event.pageX;
					var distanceMoved = clickDownPos - currentMousePos;
					console.log(distanceMoved + 'px');

					// update slider pos
						// ensure pos is not across other min/max
					// calc newPos as percentage of slider width
					// round position to nearest 16th
					// update scope.min/max value 
				}
			}
			scope.stopMove = function() {
				scope.currentSlider = false;
				clickedEl = null;
			}
		}
	}
}]);