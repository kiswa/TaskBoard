taskBoardServices.factory('TokenInterceptor',
['$q', '$window', '$location', 'AuthenticationService',
 function ($q, $window, $location, AuthenticationService) {
     return {
         request: function(config) {
             config.headers = config.headers || {};
             if ($window.localStorage.token) {
                 config.headers.Authorization = $window.localStorage.token;
             }
             return config;
         },

         requestError: function(rejection) {
             return $q.reject(rejection);
         },

         response: function(response) {
             if (response !== null && response.status === 200 &&
                 $window.localStorage.token && !AuthenticationService.isAuthenticated) {
                 AuthenticationService.isAuthenticated = true;
             }
             return response || $q.when(response);
         },

         responseError: function(rejection) {
             if (rejection !== null && rejection.status === 401 &&
                 ($window.localStorage.token || AuthenticationService.isAuthenticated)) {
                 delete $window.localStorage.token;
                 AuthenticationService.isAuthenticated = false;
                 $location.path('/');
             }
             return $q.reject(rejection);
         }
     };
 }]);
