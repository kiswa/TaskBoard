taskBoardDirectives.directive('clickToEdit', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: 'partials/clickToEdit.html',
        scope: {
            value: '=clickToEdit'
        },
        controller: ['$scope', function($scope) {
            $scope.view = {
                editableValue: $scope.value,
                editorEnabled: false
            };

            $scope.enableEditor = function() {
                $scope.view.editableValue = $scope.value;
                $scope.view.editorEnabled = true;
            };

            $scope.save = function() {
                $scope.value = $scope.view.editableValue;
                $scope.view.editorEnabled = false;
            };

            $scope.checkKeypress = function(e) {
                if (e.which === 13) { // Enter key
                    $scope.save();
                    e.preventDefault();
                } else if (e.which === 27) { // Escape key
                    $scope.view.editorEnabled = false;
                    e.preventDefault();
                }
            };
        }]
    };
});
