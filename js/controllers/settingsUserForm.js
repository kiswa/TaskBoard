taskBoardControllers.controller('UserFormSettingsCtrl',
['$scope', 'UserService',
function ($scope, UserService) {
    $scope.userFormData = {
        setFocus: false,
        userId: 0,
        isAdd: true,
        username: '',
        password: '',
        email: '',
        verifyPass: '',
        defaultBoard: null,
        isAdmin: false,
        passError: false,
        usernameError: false,
        emailError: false,
        isSaving: false,
        setUser: function(user) {
            this.reset();

            this.isAdd = false;
            this.userId = user.id;
            this.username = user.username;
            this.email = user.email;
            this.defaultBoard = user.default_board;
            this.isAdmin = user.is_admin == '1';
        },
        reset: function() {
            $('.popover-dismiss').popover();
            this.setFocus = true;
            this.userId = 0;
            this.isAdd = true;
            this.username = '';
            this.password = '';
            this.email = '';
            this.verifyPass = '';
            this.defaultBoard = null;
            this.isAdmin = false;
            this.passError = false;
            this.usernameError = false;
            this.isSaving = false;
        },
        cancel: function() {
            $('.userModal').modal('hide');
            var that = this;
            $('.userModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        },
        setForSaving: function() {
            this.isSaving = true;
            this.usernameError = false;
            this.passError = false;
        },
        setAlert: function(user, pass, message) {
            this.isSaving = false;
            this.usernameError = user;
            this.passError = pass;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        }
    };
    $scope.$parent.userFormData = $scope.userFormData;

    $scope.editUser = function(userFormData) {
        userFormData.setForSaving();

        if (userFormData.username === '') {
            userFormData.setAlert(true, false, 'Username cannot be blank.');
        } else {
            userFormData.isSaving = true;

            if(userFormData.password == userFormData.verifyPass) {
                UserService.editUser(userFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateUsers(data.data);
                    $scope.updateBoardsList(data.boards);

                    if (data.alerts[0].type == 'success') {
                        $('.userModal').modal('hide');
                        userFormData.password = '';
                        userFormData.verifyPass = '';
                    }
                });
            } else {
                userFormData.setAlert(false, true, 'Passwords do not match.');
            }
        }
    };

    $scope.addUser = function(userFormData) {
        userFormData.setForSaving();

        if (userFormData.username === '') {
            userFormData.setAlert(true, false, 'Username cannot be blank.');
        } else if (userFormData.password === '' || userFormData.verifyPass === '') {
            userFormData.setAlert(false, true, 'Password cannot be blank.');
        } else {
            userFormData.isSaving = true;

            if(userFormData.password == userFormData.verifyPass) {
                UserService.addUser(userFormData)
                .success(function(data) {
                    $scope.alerts.showAlerts(data.alerts);
                    $scope.updateUsers(data.data);
                    $scope.updateBoardsList(data.boards);
                    userFormData.reset();

                    if (data.alerts[0].type == 'success') {
                        $('.userModal').modal('hide');
                    }
                });
            } else {
                userFormData.setAlert(false, true, 'Passwords do not match.');
            }
        }
    };
}]);
