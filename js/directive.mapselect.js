app.directive('jdMapSelect', [ function(){
	return {
		restrict: 'E',
		scope: {
			newClimb: '='
		},
		require: '^jdUploadView',
		templateUrl: 'directives/mapSelect.html',
		link: function(scope, element, attributes, controller) {

			// render google map
			// use center of map for location
			// on 'idle', set the newLocation lat/lng in the view,
			// when form is submitted, retrieve place details
				// city
				// state

			//scope.map = new google.maps

		}
	}
}]);