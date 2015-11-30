
app.directive('jdListView', ['User', function(User){
	return {
		restrict: 'E',
		templateUrl: "/js/directives/listView.html",
		link: function(scope, element, attributes) {

			scope.userProfile = User.user();

			

		}
	};
}]);