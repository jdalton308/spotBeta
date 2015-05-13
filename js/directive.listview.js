
app.directive('jdListView', ['User', function(User){
	return {
		restrict: 'E',
		templateUrl: "directives/listView.html",
		link: function(scope, element, attributes) {

			scope.userProfile = User.user();

			// SHOW/HIDE
			//==========================

			scope.showLists = false;

			scope.toggleLists = function() {
				scope.showLists = !scope.showLists;
			};

		}
	};
}]);