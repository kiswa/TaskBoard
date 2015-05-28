taskBoardControllers.controller('SettingsCtrl',
['$scope', 'UserService', 'AlertService',
function ($scope, UserService, AlertService) {
    $scope.alerts = AlertService;

    $scope.users = [];
    $scope.boards = [];
    $scope.boardNames = [];

    $scope.boardLookup = {};
    $scope.currentUser = {};
    $scope.slide = {
        open: false
    };

    $scope.loadingCurrentUser = true;
    $scope.loadingBoards = true;
    $scope.loadingUsers = true;

    $scope.loadCurrentUser = function() {
        UserService.currentUser()
        .success(function(data) {
            $scope.currentUser = data.data;
            $scope.loadingCurrentUser = false;
            $scope.currentUser.options.tasksOrder = parseInt(data.data.options.tasksOrder);
            $scope.currentUser.options.showAnimations = data.data.options.showAnimations === "1";
            $scope.currentUser.options.showAssignee = data.data.options.showAssignee === "1";
        });
    };
    $scope.loadCurrentUser();

    $scope.updateBoardsList = function(data) {
        if (undefined === data) {
            return;
        }

        $scope.loadingBoards = false;
        if (null === data) {
            $scope.boards = [];
            return;
        }
        $scope.boards = data;

        var boardNames = [];
        data.forEach(function(board) {
            boardNames.push({ 'id': board.id, 'name':board.name, 'active':board.active });
        });
        $scope.boardNames = boardNames;

        for (var i = 0, len = boardNames.length; i < len; i++) {
            $scope.boardLookup[boardNames[i].id] = boardNames[i].name;
        }
        $scope.updateActions();
    };

    $scope.updateUsers = function(data) {
        if (undefined === data || null === data) {
            return;
        }

        $scope.users = data;
        $scope.loadingUsers = false;
        $scope.updateActions();
    };

    $scope.actions = [];
    $scope.actionsLoading = true;
    $scope.updateActions = function() {
        if ('1' !== $scope.currentUser.isAdmin) {
            return;
        }
        UserService.actions()
        .success(function(data) {
            $scope.actions = data.data;
            if ($scope.actions) {
                var date = new Date();
                $scope.actions.forEach(function(action) {
                    date.setTime(action.timestamp * 1000);
                    action.date = date.toLocaleString();
                });
            }
            $scope.actionsLoading = false;
        });
    };
    $scope.updateActions();
}]);
