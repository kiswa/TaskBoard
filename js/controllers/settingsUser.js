taskBoardControllers.controller('UserSettingsCtrl',
['$scope', '$interval', 'UserService',
function ($scope, $interval, UserService) {
    var pendingResponse = false,
        retryCount = 3,
        loadUsers = function() {
            if (pendingResponse) {
                return;
            }

            pendingResponse = true;
            UserService.getUsers()
            .success(function(data) {
                $scope.updateUsers(data.data);
                pendingResponse = false;
                retryCount = 3;
            })
            .error(function() {
                if (retryCount--) {
                    pendingResponse = false;
                    return;
                }

                $interval.cancel($scope.interval);
                $scope.$parent.loadingUsers = false;
            });
        };

    loadUsers();
    $scope.interval = $interval(loadUsers, 5000);
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); });

    $scope.passwordFormData = {
        currentPass: '',
        newPass: '',
        verifyPass: '',
        newPassError: false,
        currentPassError: false,
        isSaving: false,
        setForSaving: function() {
            this.newPassError = false;
            this.currentPassError = false;
            this.isSaving = true;
        },
        setAlert: function(newError, oldError, message) {
            this.newPassError = newError;
            this.currentPassError = oldError;
            this.isSaving = false;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        },
        reset: function() {
            this.currentPass = '';
            this.newPass = '';
            this.verifyPass = '';
            this.newPassError = false;
            this.currentPassError = false;
            this.isSaving = false;
        }
    };
    $scope.changePassword = function(passwordFormData) {
        passwordFormData.setForSaving();

        if (passwordFormData.currentPass === '') {
            passwordFormData.setAlert(false, true, 'Current password cannot be blank.');
        } else if (passwordFormData.newPass === '' || passwordFormData.verifyPass === '') {
            passwordFormData.setAlert(true, false, 'New password cannot be blank.');
        } else {
            if(passwordFormData.newPass == passwordFormData.verifyPass) {
                UserService.changePassword(passwordFormData.currentPass, passwordFormData.newPass)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    passwordFormData.isSaving = false;
                    passwordFormData.currentPass = '';
                    if (data.alerts[0].text == "Password changed.") {
                        passwordFormData.reset();
                    } else {
                        passwordFormData.currentPassError = true;
                    }
                });
            } else {
                passwordFormData.setAlert(true, false, 'New passwords do not match.');
            }
        }
    };

    $scope.usernameFormData = {
        newUsername: '',
        usernameError: false,
        isSaving: false,
        setAlert: function(message) {
            this.isSaving = false;
            this.usernameError = true;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        },
        reset: function() {
            this.newUsername = '';
            this.usernameError = false;
            this.isSaving = false;
        }
    };
    $scope.changeUsername = function(newUsernameFormData) {
        $scope.usernameFormData.isSaving = true;

        if (newUsernameFormData.newUsername === '') {
            newUsernameFormData.setAlert('Username cannot be blank.');
            newUsernameFormData.isSaving = false;
        } else {
            UserService.changeUsername(newUsernameFormData.newUsername)
            .success(function(data) {
                $scope.alerts.showAlerts(data.alerts);
                $scope.updateUsers(data.data);
                $scope.loadCurrentUser();

                newUsernameFormData.isSaving = false;
                newUsernameFormData.newUsername = '';
            });
        }
    };

    $scope.updatingDefaultBoard = false;
    $scope.setDefaultBoard = function() {
        $scope.updatingDefaultBoard = true;

        UserService.changeDefaultBoard($scope.currentUser.defaultBoard)
        .success(function(data) {
            $scope.updatingDefaultBoard = false;
            $scope.updateUsers(data.data);
            $scope.alerts.showAlert({ 'type': 'success', 'text': 'Default board changed.' });
        });
    };

    $scope.isDeleting = [];
    $scope.removeUser = function(userId) {
        noty({
            text: 'Deleting a user cannot be undone.<br>Continue?',
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {
                    addClass: 'btn btn-default',
                    text: 'Ok',
                    onClick: function($noty) {
                        $noty.close();
                        $scope.isDeleting[userId] = true;

                        UserService.removeUser(userId)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                            $scope.updateUsers(data.data);
                            $scope.updateBoardsList(data.boards);
                        });
                    }
                },
                {
                    addClass: 'btn btn-info',
                    text: 'Cancel',
                    onClick: function($noty) {
                        $noty.close();
                    }
                }
            ]
        });
    };
}]);
