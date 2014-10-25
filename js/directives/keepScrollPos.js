// Source: http://stackoverflow.com/a/25073496/1110183
taskBoardDirectives.directive("keepScrollPos",
['$route', '$window', '$timeout', '$location', '$anchorScroll',
function($route, $window, $timeout, $location, $anchorScroll) {
    // Cache scroll position of each route's templateUrl.
    var scrollPosCache = {};

    // Compile function
    return function(scope, element, attrs) {
        scope.$on('$routeChangeStart', function() {
            if ($route.current) {
                scrollPosCache[$route.current.loadedTemplateUrl] = [$window.pageXOffset, $window.pageYOffset];
            }
        });

        scope.$on('$routeChangeSuccess', function() {
            // If hash is specified explicitly, it trumps previously stored scroll position.
            if ($location.hash()) {
                $anchorScroll();
            } else {
                var prevScrollPos = scrollPosCache[$route.current.loadedTemplateUrl] || [0, 0];
                $timeout(function() {
                    $window.scrollTo(prevScrollPos[0], prevScrollPos[1]);
                }, 0);
            }
        });
    }
}]);
