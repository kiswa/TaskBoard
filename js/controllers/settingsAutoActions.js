taskBoardControllers.controller('AutomaticActionsCtrl',
['$scope', '$interval', 'BoardService',
function ($scope, $interval, BoardService) {
    $scope.loadingActions = false; // Change to true once loading is implemented
    $scope.actions = [];

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

    $scope.actionOptions = {
        triggers: [
            {
                id: 0,
                trigger: 'Item moves to lane',
                actions: [
                    { id: 0, action: 'Set item color' },
                    { id: 1, action: 'Set item category'},
                    { id: 2, action: 'Set item assignee' },
                    { id: 3, action: 'Clear item due date' }
                ]
            },
            {
                id: 1,
                trigger: 'Item assigned to user',
                actions: [
                    { id: 0, action: 'Set item color' },
                    { id: 1, action: 'Set item category'},
                    { id: 3, action: 'Clear item due date' }
                ]
            },
            {
                id: 2,
                trigger: 'Item set to category',
                actions: [
                    { id: 0, action: 'Set item color' },
                    { id: 2, action: 'Set item assignee' },
                    { id: 3, action: 'Clear item due date' }
                ]
            }
        ]
    };

    $scope.updateActions = function() {
        BoardService.getAutoActions()
        .success(function(data) {
            $scope.actions = data.data;
        });
    };
    $scope.updateActions();

    $scope.addAction = function() {
        if ($scope.actionData.secondary === null ||
            ($scope.actionData.action !== 3 &&
             ($scope.actionData.color === null && $scope.actionData.category === null && $scope.actionData.assignee === null))) {
            $scope.alerts.showAlert({ type: 'error', text: 'One or more required fields are not entered. Automatic Action not added.' });
            return;
        }

        BoardService.addAutoAction($scope.actionData)
        .success(function(data) {
            $scope.alerts.showAlerts(data.alerts);
            if (data.alerts[0].type == 'success') {
                $scope.updateActions();
            }
        });
    };

    $scope.secondarySelection = [];
    $scope.updateSecondary = function() {
        $scope.secondarySelection = [];
        $scope.actionData.secondary = null;
        $scope.actionData.action = 0;
        var boardData = null;

        $scope.boards.forEach(function(board) {
            if (board.id === $scope.actionData.board) {
                boardData = board;
                $scope.boardCategories = board.ownCategory;
                $scope.userList = board.sharedUser;
            }
        });

        if (null !== boardData) {
            switch($scope.actionData.trigger) {
                case 0:
                    $scope.secondarySelection = boardData.ownLane;
                    break;
                case 1:
                    $scope.secondarySelection = boardData.sharedUser;
                    $scope.secondarySelection.forEach(function(user) {
                        user.name = user.username;
                    });
                    break;
                case 2:
                    $scope.secondarySelection = boardData.ownCategory;
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
            palette: [[]],
            showSelectionPalette: true,
            showButtons: false,
            showInput: true,
            preferredFormat: 'hex3',
            disabled: $scope.actionData.board === null
        });
    };
    $scope.updateColorpicker = function() {
        if (null !== $scope.actionData.board) {
            $('#spectrum').spectrum("enable");
            return;
        }
        $('#spectrum').spectrum("disable");
    };

    // Check every 250ms to see if a board has been chosen.
    var updateIfBoardChosen = function() {
        if ($scope.actionData.board !== null) {
            $interval.cancel($scope.interval); // Stop checking once it has.
            $scope.getTriggerWord();
        }
    };
    $scope.interval = $interval(updateIfBoardChosen, 250);
    $scope.$on('$destroy', function () { $interval.cancel($scope.interval); });
}]);
