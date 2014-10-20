taskBoardControllers.controller('LoginCtrl',
['$rootScope', '$scope', '$location', '$window', 'UserService', 'AuthenticationService', 'AlertService',
function ($rootScope, $scope, $location, $window, UserService, AuthenticationService, AlertService) {
    $scope.formdata = {
        username: '',
        password: '',
        rememberme: false
    };
    $scope.isSaving = false;

    // Uses jQuery to handle clearing of any open modals.
    $scope.clear = function() {
        $('[name~=Modal]').modal('hide');
        $('.modal-backdrop').hide();
    };

    $scope.logIn = function (formdata) {
        $scope.errors = [];
        $scope.isSaving = true;

        UserService.logIn(formdata.username, formdata.password, formdata.rememberme)
        .success(function(data) {
            if (null !== data.alerts) {
                AlertService.showAlerts(data.alerts);
            }
            AuthenticationService.isAuthenticated = true;
            $window.localStorage.token = data.data;
            $location.path('/boards');
        }).error(function(data, status) {
            $scope.isSaving = false;
            $scope.errors.push(data.message);
            if (status === 503) {
                $scope.errors[0] = $scope.errors[0] + ' Ensure api directory is writable.';
            }
        });
    };
}
]);
