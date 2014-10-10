taskBoardDirectives.directive('fileUpload', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var fileModel = $parse(attrs.fileUpload),
                resetModel = $parse(attrs.resetFlag);

            // When the resetFlag attribute value changes, reset the input.
            scope.$watch(resetModel, function(val) {
                if (val) {
                    element[0].value = '';
                    resetModel.assign(scope, false);
                }
            });

            // Bind the file to the model on change event.
            element.bind('change', function() {
                scope.$apply(function() {
                    fileModel.assign(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
