var taskBoardServices = angular.module('TaskBoardServices', []);
var taskBoardControllers = angular.module('TaskBoardControllers', []);
var taskBoardDirectives = angular.module('TaskBoardDirectives', []);

var taskBoard = angular.module('TaskBoard',
                               ['ngRoute', 'ngSanitize',
                                'ng-context-menu',
                                'TaskBoardServices',
                                'TaskBoardControllers',
                                'TaskBoardDirectives']);

taskBoard.config(['$routeProvider', '$httpProvider',
function($routeProvider, $httpProvider) {
    $routeProvider.when('/', {
        controller: 'LoginCtrl',
        templateUrl: 'partials/login.html'
    }).when('/boards', {
        controller: 'BoardCtrl',
        templateUrl: 'partials/boardSelect.html',
        authRequired: true
    }).when('/boards/:boardId', {
        controller: 'BoardCtrl',
        templateUrl: 'partials/board.html',
        authRequired: true,
        resolve: {
            validation: ['$q', '$route', function($q, $route) {
                var deferred = $q.defer(),
                    id = parseInt($route.current.params.boardId);
                if (isNaN(id)) {
                    deferred.reject('INVALID BOARD ID');
                } else {
                    deferred.resolve();
                }
                return deferred.promise;
            }]
        }
    }).when('/settings', {
        controller: 'SettingsCtrl',
        templateUrl: 'partials/settings.html',
        authRequired: true
    }).when('/files/:fileId', {
        controller: 'FilesCtrl',
        templateUrl: 'partials/files.html',
        authRequired: true
    }).otherwise({
        redirectTo: '/'
    });

    // Inject the auth token with each API call.
    $httpProvider.interceptors.push('TokenInterceptor');
}]);

// Custom handlers for route authentication and rejection of invalid board id
taskBoard.run(['$rootScope', '$location', '$window', 'AuthenticationService',
function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.version = 'v0.2.6';

    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
        // Redirect to default path if authentication is required but not present.
        if (nextRoute !== null && nextRoute.authRequired !== null &&
            nextRoute.authRequired && !AuthenticationService.isAuthenticated &&
            !$window.localStorage.token) {
            $location.path('/');
        }
        if (nextRoute !== null && nextRoute.controller === 'LoginCtrl' && $window.localStorage.token) {
            $location.path('/boards');
        }
    });

    $rootScope.$on('$routeChangeSuccess', function(event, route, previousRoute) {
        if (route.controller === 'LoginCtrl' && previousRoute && previousRoute.originalPath !== '') {
            AuthenticationService.attemptedRoute = previousRoute;
        }
    });

    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
        // Custom rejection from /boards/:boardId route
        if (rejection === 'INVALID BOARD ID') {
            $location.path('/boards');
        }
    });
}]);
