taskBoardControllers.controller('BoardCtrl',
['$scope', '$routeParams', '$location', '$interval', '$window',
 'UserService', 'BoardService', 'AlertService', 'AuthenticationService',
function ($scope, $routeParams, $location, $interval, $window,
          UserService, BoardService, AlertService, AuthenticationService) {
    // This is here because the BoardCtrl is the default redirect from login.
    // If the user was trying to go somewhere else first, they are redirected now.
    if (AuthenticationService.attemptedRoute) {
        var tmp = AuthenticationService.attemptedRoute,
            path = tmp.originalPath;

        tmp.keys.forEach(function(key) {
            path = path.replace(':' + key.name, tmp.params[key.name]);
        });
        AuthenticationService.attemptedRoute = null;
        $location.path(path);
    }

    $scope.alerts = AlertService;
    $scope.marked = function(text) {
        if (text) {
            return $window.marked(text);
        } else {
            return '';
        }
    };

    $scope.boardId = $routeParams.boardId;
    $scope.filter = {
        user: null,
        category: null,
        hide: false
    };

    $scope.filterChanged = function() {
        $scope.currentBoard.ownLane.forEach(function (lane) {
            if (lane.ownItem) {
                lane.ownItem.forEach(function (item) {
                    item.filtered = false;
                    if ($scope.filter.user !== null) {
                        if ($scope.filter.user != item.assignee) {
                            item.filtered = true;
                        }
                    }
                    if ($scope.filter.category !== null) {
                        if ($scope.filter.category != item.category) {
                            item.filtered = true;
                        }
                    }
                });
            }
        });
    };

    $scope.selectBoard = function() {
        $location.path('boards/' + $scope.boardNames.current);
    };

    $scope.openEditItem = function() {
        $scope.itemFormData.loadItem($scope.contextItem);
        $('.itemModal textarea').css('height', 'auto');
        $('.itemModal').modal('show');
    };

    $scope.openAddItem = function() {
        $scope.itemFormData.reset($scope.contextLaneId);
        $('.itemModal textarea').css('height', 'auto');
        $('.itemModal').modal('show');
    };

    $scope.removeItem = function() {
        $scope.openItem($scope.contextItem, false);
        $scope.deleteItem();
    };

    $scope.changeItemLane = function() {
        $scope.itemFormData.loadItem($scope.contextItem);
        $scope.itemFormData.isAdd = false;

        $scope.submitItem($scope.itemFormData);
    };

    $scope.contextItem = {}; // Needs to exist prior to onContextMenu call.
    $scope.onContextMenu = function(laneId, item) {
        $scope.contextItem = item;
        $scope.contextLaneId = laneId;
    };

    // This is called every 250ms until the boards are loaded.
    // Once loaded, the repetitive calling is canceled.
    // If a default is found the user is redirected to that board.
    var checkDefaultBoard = function() {
        if ($scope.boardId) {
            $interval.cancel($scope.interval);
        }
        if ($scope.boardsLoaded && !$scope.boardId && $scope.currentUser && parseInt($scope.currentUser.defaultBoard)) {
            $interval.cancel($scope.interval);
            $location.path('boards/' + $scope.currentUser.defaultBoard);
        }
    };
    $scope.interval = $interval(checkDefaultBoard, 250);
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); });

    $scope.boards = [];
    $scope.boardsLoaded = false;
    $scope.boardNames = [];
    $scope.userNames = [];
    $scope.laneNames = [];
    $scope.categories = [];
    $scope.currentBoard = {
        loading: true,
        name: 'Kanban Board App'
    };

    var pendingResponse = false,
        updateCounter = 0;

    $scope.isActiveFilter = function(element) {
        var retVal = false;
        $scope.boards.forEach(function(board) {
            if (board.id === element.id) {
                retVal = (board.active === '1');
            }
        }, this);

        return retVal;
    };

    $scope.loadBoards = function() {
            // Don't update the boards if an update is pending.
            if (pendingResponse || updateCounter) {
                return;
            }

            pendingResponse = true;
            BoardService.getBoards()
            .success(function(data) {
                pendingResponse = false;
                $scope.updateBoards(data);
            });
        };
    $scope.loadBoards();
    $scope.boardInterval = $interval($scope.loadBoards, 10000);
    $scope.$on('$destroy', function () { $interval.cancel($scope.boardInterval); });

    $scope.updateBoards = function(data) {
        // Don't update the boards if a position update is pending.
        if (0 !== updateCounter) {
            return;
        }
        $scope.boards = data.data;
        $scope.boardsLoaded = true;

        var boardFound = false;
        if ($scope.boards) {
            $scope.boardNames = [];
            $scope.boards.forEach(function(board) {
                if (parseInt(board.active) === 1) {
                    // Add each board's name to the list.
                    $scope.boardNames.push({id: board.id, name: board.name});
                }

                // If the board is the current board, process and assign it.
                if (board.id == $scope.boardId) {
                    board.sharedUser.unshift({ id: 0, username: 'Unassigned' });
                    board.sharedUser.forEach(function(user) {
                        $scope.userNames[user.id] = user.username;
                    });

                    board.ownLane.forEach(function(lane) {
                        $scope.laneNames[lane.id] = lane.name;
                        if (lane.ownItem) {
                            lane.ownItem.forEach(function(item) {
                                var date = new Date(item.due_date),
                                    diff = date - Date.now();
                                if (diff < 0) {
                                    item.datePast = true;
                                } else if (diff < (1000 * 60 * 60 * 24 * 3)) { // Three days
                                    item.dateNear = true;
                                }

                                item.position = parseInt(item.position);
                            });
                        }
                    });

                    if (board.ownCategory) {
                        board.ownCategory.unshift({ id: 0, name: 'Uncategorized' });
                        board.ownCategory.forEach(function(category) {
                            $scope.categories[category.id] = category.name;
                        });
                    }

                    $scope.currentBoard = board;
                    $scope.boardNames.current = board.id;
                    boardFound = true;
                }
            });
        }

        if (boardFound) {
            $scope.filterChanged(); // Make sure any filters are still applied.
            $scope.currentBoard.loading = false;
            if ($scope.currentBoard.active === '0') {
                $scope.currentBoard = {
                    loading: true,
                    name: 'Kanban Board App',
                    error: true
                };
            }
        } else {
            $scope.currentBoard.error = true;
        }
    };

    $scope.toggleLane = function(lane) {
        lane.collapsed = !lane.collapsed;
        updateCounter++;

        BoardService.toggleLane(lane.id)
        .success(function(data) {
            updateCounter--;
            $scope.updateBoards(data);
        });
    };

    // This is not the Angular way.
    $scope.updateSortables = function() {
        var that = this.$parent;
        $('.itemContainer').sortable({
            connectWith: '.itemContainer',
            placeholder: 'draggable-placeholder',
            items: 'div:not(.addItem, .itemHeader, .description)',
            change: function(event, ui) {
                var parent = $(ui).parent(),
                    addItem = parent.find('.addItem');

                addItem.detach();
                parent.append(addItem);
            },
            stop: function(event, ui) {
                var lanes = $.find('.boardColumn'),
                    positionArray = [];

                $(lanes).each(function() {
                    var laneId = $(this).attr('data-lane-id');
                    $(this).find('.boardItem').each(function(index) {
                        var itemId = $(this).attr('data-item-id');
                        positionArray.push({
                            item: itemId,
                            lane: laneId,
                            position: index
                        });
                    });
                });
                that.updatePositions(positionArray);
            }
        });
    };

    $scope.updatePositions = function(positionArray) {
        updateCounter++;
        BoardService.updateItemPositions(positionArray)
        .success(function(data) {
            updateCounter--;
            $scope.updateBoards(data);
        });
    };

    $scope.currentUser = {};
    $scope.userLoaded = false;
    $scope.updateCurrentUser = function() {
        UserService.currentUser()
        .success(function(data) {
            $scope.userLoaded = true;
            $scope.currentUser = data.data;
        });
    };
    $scope.updateCurrentUser();
}]);
