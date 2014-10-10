taskBoardControllers.controller('ItemFormBoardCtrl',
['$scope', 'BoardService',
function ($scope, BoardService) {
    var defaultColor = '#ffffe0';

    $scope.itemFormData = {
        isSaving: false,
        isAdd: true,
        itemId: 0,
        title: '',
        titleError: false,
        description: '',
        assignee: 0,
        category: 0,
        lane: 0,
        color: defaultColor,
        dueDate: null,
        points: null,
        pointsError: false,
        reset: function(laneId) {
            $('.popover-dismiss').popover({html:true});
            this.isSaving = false;
            this.isAdd = true;
            this.itemId = 0;
            this.title = '';
            this.titleError = false;
            this.description = '';
            this.assignee = 0;
            this.category = 0;
            this.lane = laneId || 0;
            this.color = defaultColor;
            this.spectrum(); // Reset the color plugin to default as well.
            this.dueDate = null;
            this.points = null;
            this.pointsError = false;
            var that = this;
            $('.itemModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        },
        loadItem: function(item) {
            this.reset(item.lane_id);
            this.isAdd = false;
            this.itemId = item.id;
            this.title = item.title;
            this.description = item.description;
            this.assignee = item.assignee === "0" ? 0 : item.assignee;
            this.category = item.category === "0" ? 0 : item.category;
            this.color = item.color;
            this.spectrum(this.color);
            this.dueDate = item.due_date;
            this.points = parseInt(item.points);
            this.position = item.position;
        },
        // Uses jQuery to close the modal and reset colorpicker.
        cancel: function() {
            $('.itemModal').modal('hide');
            $('#spectrum').spectrum('hide');
            $('#spectrum').spectrum('enable');
        },
        // Uses jQuery to set the colorpicker.
        spectrum: function(color) {
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
                appendTo: '#addEdit'
            });
        },
        // Uses jQuery to set the datepicker.
        datePicker: function() {
            $('#datepicker').datepicker();
        }
    };
    $scope.$parent.itemFormData = $scope.itemFormData;

    $scope.submitItem = function (itemFormData) {
        itemFormData.isSaving = true;
        $('#spectrum').spectrum('disable');

        itemFormData.titleError = false;
        if (itemFormData.title === '') {
            $scope.alerts.showAlert({
                type:'error',
                text: 'Title is required to add a new item.'
            });
            itemFormData.isSaving = false;
            itemFormData.titleError = true;
            return;
        }
        itemFormData.pointsError = false;
        if (itemFormData.points === undefined) { // It is undefined if invalid
            $scope.alerts.showAlert({
                type:'error',
                text: 'Points must be greater than or equal to zero (or left empty).'
            });
            itemFormData.isSaving = false;
            itemFormData.pointsError = true;
            return;
        }

        if (itemFormData.isAdd) {
            BoardService.addItem(itemFormData, $scope.currentBoard.id)
            .success(function(data) {
                isSuccess(data);
            });
        } else {
            BoardService.updateItem(itemFormData)
            .success(function(data) {
                isSuccess(data);
            });
        }
    };

    var isSuccess = function(data) {
        $scope.alerts.showAlerts(data.alerts);
        if (data.alerts[0].type == 'success') {
            $scope.updateBoards(data);
            $scope.itemFormData.cancel();
        }
    };
}]);
