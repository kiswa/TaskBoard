taskBoardDirectives.directive('focus', ['$timeout', function($timeout) {
    return {
        link: function(scope, elem, attrs) {
            scope.$watch(attrs.focus, function(val) {
                if (angular.isDefined(val) && val) {
                    $timeout(function() {
                        elem[0].focus();
                        scope.$eval(attrs.focus + ' = false');
                    }, 500);
                }
            }, true);
        }
    };
}]);
