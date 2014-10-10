// Simple directive to include a partial and completely replace the element included from.
taskBoardDirectives.directive('includeReplace', function () {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: function(element, attributes) {
            return attributes.includeReplace;
        }
    };
});
