taskBoardServices.factory('AuthenticationService', [
function() {
    return {
        isAuthenticated: false,
        attemptedRoute: null,

        reset: function() {
            this.isAuthenticated = false;
            this.attemptedRoute = null;
        }
    };
}]);
