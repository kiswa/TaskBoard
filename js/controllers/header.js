taskBoardControllers.controller('HeaderCtrl',
['$scope', '$window', '$location', 'UserService', 'AuthenticationService', 'AlertService',
function ($scope, $window, $location, UserService, AuthenticationService, AlertService) {
    UserService.validateToken()
    .error($scope.logout);

    $scope.display = {
        username: '',
        smallText: ' - Settings'
    };
    $scope.$parent.display = $scope.display;
    $scope.$watch('currentUser', function(newValue, oldValue) {
        if (undefined !== newValue && undefined !== newValue.username) {
            $scope.display.username = '(' + newValue.username + ')';
        }
    });

    $scope.page = {
        boards: false,
        settings: true
    };

    if ($location.path().indexOf('boards') > -1) {
        $scope.page.boards = true;
        $scope.page.settings = false;
        $scope.$watch('currentBoard.name', function(newValue, oldValue) {
            $scope.display.smallText = ' - ' + newValue;
        });
    }
    if ($location.path().indexOf('files') > -1) {
        $scope.page.boards = false;
        $scope.page.settings = false;
        $scope.display.smallText = ' - File Viewer';
    }

    try {
        $.noty.closeAll(); // Clear any alerts on page load.
    } catch(e) {}

    $scope.logout = function() {
        UserService.logOut()
        .then(function(data) {
            AuthenticationService.reset();
            delete $window.localStorage.token;
            $location.path('/');
        });
    };
}]);
