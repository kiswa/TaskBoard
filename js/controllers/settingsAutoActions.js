taskBoardControllers.controller('AutomaticActionsCtrl',
['$scope', '$interval', 'BoardService',
function ($scope, $interval, BoardService) {
    var defaultColor = '#ffffe0';
    $scope.loadingActions = true;
    $scope.actions = [];

    $scope.secondarySelection = [];
    $scope.boardCategories = [{ id: 0, name: 'Uncategorized', color: defaultColor }];
    $scope.userList = [{ id: 0, name: 'Unassigned', username: 'Unassigned' }];

    $scope.actionData = {
        isSaving: false,
        board: null,
        trigger: 0,
        triggerWord: '',
        secondary: null,
        action: 0,
        color: null,
        category: null,
        assignee: null
    };
    $scope.actionDeleting = [];

    $scope.actionTypes = [
        { id: 0, action: 'Set item color' },
        { id: 1, action: 'Set item category'},
        { id: 2, action: 'Set item assignee' },
        { id: 3, action: 'Clear item due date' }
    ];

    $scope.actionOptions = {
        triggers: [
            { id: 0, trigger: 'Item moves to column' },
            { id: 1, trigger: 'Item assigned to user' },
            { id: 2, trigger: 'Item set to category' }
        ]
    };

    $scope.updateTriggers = function() {
        var foundCategories = false;
        $scope.actionOptions.triggers.forEach(function(trigger) {
            if (trigger.id === 2) {
                foundCategories = true;
            }
        }, this);

        if (!foundCategories) {
            $scope.actionOptions.triggers.push({ id: 2, trigger: 'Item set to category' });
        }

        if ($scope.boardCategories.length === 1) {
            $scope.actionOptions.triggers.forEach(function(trigger, index) {
                if (trigger.id === 2) {
                    $scope.actionOptions.triggers.splice(index, 1);
                }
            });
            $scope.actionTypes.forEach(function(type, index) {
                if (type.id === 1) {
                    $scope.actionTypes.splice(index, 1);
                }
            });
        }
    };

    var getBoardData = function(boardId) {
            if (null === boardId || undefined === boardId)
            {
                return;
            }

            var boardData;
            $scope.boards.forEach(function(board) {
                if (board.id === boardId) {
                    boardData = board;
                }
            });

            return boardData;
        },

        getCategories = function(boardData) {
            var categories = [{ id: '0', name: 'Uncategorized', color: defaultColor }];

            if (boardData && boardData.ownCategory) {
                boardData.ownCategory.forEach(function(category) {
                    categories.push(category);
                });
            }
            return categories;
        },

        getUsers = function(boardData) {
            var userList = [{ id: '0', name: 'Unassigned', username: 'Unassigned' }];

            if (boardData) {
                boardData.sharedUser.forEach(function(user) {
                    userList.push({ id: user.id, name: user.username });
                });
            }
            return userList;
        },

        getSecondaryText = function(action) {
            var text = ': ',
                actionBoard = getBoardData(action.board_id),
                boardCategories = getCategories(actionBoard),
                userList = getUsers(actionBoard);

            switch(parseInt(action.trigger_id)) {
                case 0: // Lane
                    actionBoard.ownLane.forEach(function(lane) {
                        if (lane.id === action.secondary_id) {
                            text += lane.name;
                        }
                    });
                    break;
                case 1: // User
                    userList.forEach(function(user) {
                        if (user.id === action.secondary_id) {
                            text += user.name;
                        }
                    });
                    break;
                case 2: // Category
                    boardCategories.forEach(function(category) {
                        if (category.id === action.secondary_id) {
                            text += category.name;
                        }
                    });
                    break;
            }
            return text;
        },

        getActionText = function(action) {
            var text = '',
                actionBoard = getBoardData(action.board_id),
                boardCategories = getCategories(actionBoard),
                userList = getUsers(actionBoard);

            switch(parseInt(action.action_id)) {
                case 0: // Color
                    text = ': ' + action.color;
                    break;
                case 1: // Category
                    boardCategories.forEach(function(category) {
                        if (category.id === action.category_id) {
                            text = ': ' + category.name;
                        }
                    });
                    break;
                case 2: // Assignee
                    userList.forEach(function(user) {
                        if (user.id === action.assignee_id) {
                            text = ': ' + user.name;
                        }
                    });
                    break;
            }
            return text;
        },

        updateAutoActions = function(actions) {
            if (!actions) {
                $scope.actions = [];
                return;
            }

            var mappedActions = [];
            actions.forEach(function(action) {
                var actionTrigger, actionType;
                $scope.actionOptions.triggers.forEach(function(trigger) {
                    if (trigger.id === parseInt(action.trigger_id)) {
                        actionTrigger = trigger.trigger;
                    }
                });
                $scope.actionTypes.forEach(function(type) {
                    if (type.id === parseInt(action.action_id)) {
                        actionType = type.action;
                    }
                });

                mappedActions.push({
                    id: action.id,
                    board: $scope.boardLookup[action.board_id],
                    trigger: actionTrigger + getSecondaryText(action),
                    action: actionType + getActionText(action)
                });
            });

            $scope.actions = mappedActions;
        };

    $scope.loadActions = function() {
        BoardService.getAutoActions()
        .success(function(data) {
            updateAutoActions(data.data);
            $scope.loadingActions = false;
        });
    };
    $interval($scope.loadActions, 2000);

    // Wait until boards are loaded to load the actions.
    $scope.$watch('loadingBoards', function() {
        if (!$scope.loadingBoards) {
            $scope.loadActions();
        }
    });

    $scope.addAction = function() {
        if ($scope.actionData.secondary === null ||
            ($scope.actionData.action !== 3 &&
             ($scope.actionData.color === null && $scope.actionData.category === null &&
              $scope.actionData.assignee === null))) {
            $scope.alerts.showAlert({
                type: 'error',
                text: 'One or more required fields are not entered. Automatic Action not added.'
            });
            return;
        }

        $scope.actionData.isSaving = true;
        BoardService.addAutoAction($scope.actionData)
        .success(function(data) {
            $scope.actionData.isSaving = false;
            $scope.alerts.showAlerts(data.alerts);
            if (data.alerts[0].type == 'success') {
                updateAutoActions(data.data);
            }
        });
    };

    $scope.removeAction = function(actionId) {
        $scope.actionDeleting[actionId] = true;

        BoardService.removeAutoAction(actionId)
        .success(function(data) {
            $scope.alerts.showAlerts(data.alerts);
            updateAutoActions(data.data);
        });
    };

    $scope.updateSecondary = function() {
        $scope.secondarySelection = [];
        $scope.actionData.secondary = null;
        $scope.actionData.action = 0;

        var boardData = getBoardData($scope.actionData.board);
        $scope.boardCategories = getCategories(boardData);
        $scope.updateTriggers();
        $scope.userList = getUsers(boardData);

        if (boardData) {
            switch($scope.actionData.trigger) {
                case 0:
                    $scope.secondarySelection = boardData.ownLane;
                    break;
                case 1:
                    $scope.secondarySelection = $scope.userList;
                    break;
                case 2:
                    $scope.secondarySelection = $scope.boardCategories;
                    break;
            }
        }
    };

    $scope.getTriggerWord = function() {
        if ($scope.actionData.trigger !== null) {
            var word = $scope.actionOptions.triggers[$scope.actionData.trigger].trigger.split(" ").pop();
            $scope.actionData.triggerWord = word.charAt(0).toUpperCase() + word.slice(1);
        }
        $scope.updateSecondary();
    };
    $scope.getTriggerWord();

    $scope.resetActionSecondary = function() {
        $scope.actionData.color = null;
        $scope.actionData.category = null;
        $scope.actionData.assignee = null;
    };

    var defaultColor = '#ffffe0';
    $scope.spectrum = function(color) {
        color = color || defaultColor;
        $('#spectrum').spectrum({
            color: color,
            allowEmpty: false,
            localStorageKey: 'taskboard.colorPalette',
            showPalette: true,
            palette: [ ['#fff', '#ececec', '#ffffe0', '#ffe0fa', '#bee7f4', '#c3f4b5', '#debee8', '#ffdea9', '#ffbaba'] ],
            showSelectionPalette: true,
            showButtons: false,
            showInput: true,
            preferredFormat: 'hex3',
            disabled: $scope.actionData.board === null
        });
    };
    $scope.updateColorpicker = function() {
        if (null !== $scope.actionData.board) {
            $('#spectrum').spectrum('enable');
            $scope.actionData.color = $('#spectrum').spectrum('option', 'color');
            $scope.updateSecondary();
            return;
        }
        $('#spectrum').spectrum('disable');
        $scope.actionData.color = null;
    };

    // Check every 500ms to see if a board has been chosen.
    var updateIfBoardChosen = function() {
        if ($scope.actionData.board !== null) {
            $interval.cancel($scope.interval);
            $scope.getTriggerWord();
        }
    };
    $scope.interval = $interval(updateIfBoardChosen, 500);
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); });
}]);
