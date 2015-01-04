taskBoardControllers.controller('BoardSettingsCtrl',
['$scope', '$interval', 'BoardService',
function ($scope, $interval, BoardService) {
    var pendingResponse = false,
        retryCount = 3,
        loadBoards = function() {
            if (pendingResponse) {
                return;
            }

            pendingResponse = true;
            BoardService.getBoards()
            .success(function(data) {
                $scope.updateBoardsList(data.data);
                pendingResponse = false;
                retryCount = 3;
            }).error(function(data) {
                if (retryCount--) {
                    pendingResponse = false;
                    return;
                }

                $interval.cancel($scope.interval);
                $scope.$parent.loadingBoards = false;
            });
        };

    loadBoards();
    $scope.interval = $interval(loadBoards, 5000);
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); });

    $scope.boardSort = {
        options: [
            { sort: 'id', name: 'Creation Date' },
            { sort: 'name', name: 'Board Name' },
        ],
        sort: 'name'
    };

    $scope.isDeleting = [];
    $scope.removeBoard = function(boardId) {
        noty({
            text: 'Deleting a board cannot be undone.<br>Continue?',
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {
                    addClass: 'btn btn-default',
                    text: 'Ok',
                    onClick: function($noty) {
                        $noty.close();

                        $scope.boards.forEach(function(board) {
                            if (board.id  == boardId) {
                                $scope.isDeleting[boardId] = true;
                            }
                        });

                        BoardService.removeBoard(boardId)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                            $scope.boards = data.data;
                            $scope.updateUsers(data.users);
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
