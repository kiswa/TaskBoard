taskBoardControllers.controller('BoardFormSettingsCtrl',
['$scope', 'BoardService',
function ($scope, BoardService) {
    $scope.boardFormData = {
        setFocus: false,
        boardId: 0,
        isAdd: true,
        name: '',
        lanes: [],
        laneName: '',
        categories: [],
        categoryName: '',
        users: [],
        nameError: false,
        lanesError: false,
        categoriesError: false,
        isSaving: false,
        updateLanesSorting: function() {
            var that = this;
            $('.lanes').sortable({
                placeholder: 'lane-placeholder',
                stop: function(event, ui) {
                    that.lanes.length = 0;
                    $(ui.item).parent().children().each(function(index) {
                        that.lanes.push({
                            id: $(this).find('.hidden').text(),
                            name: $(this).find('.item-text').text(),
                            position: index
                        });
                    });
                    $scope.$apply();
                }
            });
        },
        setBoard: function(board) {
            this.reset();

            this.isAdd = false;
            this.boardId = board.id;
            this.name = board.name;
            var that = this;
            if (undefined !== board.ownLane) {
                board.ownLane.forEach(function(lane) {
                    that.lanes.push({
                        id: lane.id,
                        name: lane.name,
                        position: lane.position
                    });
                });
            }
            if (undefined !== board.ownCategory) {
                board.ownCategory.forEach(function(cat) {
                    that.categories.push({
                        id: cat.id,
                        name: cat.name
                    });
                });
            }
            if (undefined !== board.sharedUser) {
                board.sharedUser.forEach(function(user) {
                    that.users[user.id] = true;
                });
            }

            this.updateLanesSorting();
        },
        addLane: function() {
            this.lanesError = false;
            if (this.laneName === '') {
                this.setAlert(false, true, false, 'Column  name cannot be empty.');
                return;
            }

            var that = this;
            this.lanes.forEach(function(lane) {
                if (that.laneName == lane.name) {
                    that.setAlert(false, true, false, 'That column name has already been added.');
                    that.lanesError = true;
                }
            });

            // Add the new lane (if no error) and reset the input.
            if (!this.lanesError) {
                this.lanes.push({
                    id: 0,
                    name: this.laneName,
                    position: this.lanes.length
                });
            }
            this.laneName = '';
            this.updateLanesSorting();
        },
        removeLane: function(lane) {
            if (this.isSaving) { return; }
            this.lanes.splice(this.lanes.indexOf(lane), 1);

            var pos = 0;
            this.lanes.forEach(function(lane) {
                lane.position = pos;
                pos++;
            });
        },
        addCategory: function() {
            this.categoriesError = false;
            if (this.categoryName === '') {
                this.setAlert(false, false, true, 'Category name cannot be empty.');
                return;
            }

            var that = this;
            this.categories.forEach(function(category) {
                if (that.categoryName == category) {
                    this.setAlert(false, false, true, 'That category name has already been added.');
                }
            });

            // Add the new category (if no error) and reset the input.
            if (!this.categoriesError) {
                this.categories.push({
                    id: 0,
                    name: this.categoryName
                });
            }
            this.categoryName = '';
        },
        removeCategory: function(category) {
            if (this.isSaving) { return; }
            this.categories.splice(this.categories.indexOf(category), 1);
        },
        setForSaving: function() {
            this.nameError = false;
            this.lanesError = false;
            this.categoriesError = false;
            this.isSaving = true;
        },
        setAlert: function(name, lane, cat, message) {
            this.nameError = name;
            this.lanesError = lane;
            this.categoriesError = cat;
            this.isSaving = false;
            $scope.alerts.showAlert({ 'type': 'error', 'text': message });
        },
        reset: function() {
            this.setFocus = true;
            this.boardId = 0;
            this.isAdd = true;
            this.name = '';
            this.lanes = [];
            this.laneName = '';
            this.categories = [];
            this.categoryName = '';
            this.users = [];
            this.nameError = false;
            this.lanesError = false;
            this.categoriesError = false;
            this.isSaving = false;
        },
        // Uses jQuery to close modal and reset form data.
        cancel: function() {
            $('.boardModal').modal('hide');
            var that = this;
            $('.boardModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        }
    };
    $scope.$parent.boardFormData = $scope.boardFormData;

    $scope.addBoard = function(boardFormData) {
        boardFormData.setForSaving();
        if (!checkFormInputs(boardFormData)) {
            return;
        }

        BoardService.addBoard(boardFormData)
        .success(function(data) {
            $scope.alerts.showAlerts(data.alerts);
            $scope.updateBoardsList(data.data);
            boardFormData.reset();

            if (data.alerts[0].type == 'success') {
                $('.boardModal').modal('hide');
            }
        });
    };

    $scope.editBoard = function(boardFormData) {
        boardFormData.setForSaving();
        if (!checkFormInputs(boardFormData)) {
            return;
        }

        BoardService.editBoard(boardFormData)
        .success(function(data) {
            $scope.alerts.showAlerts(data.alerts);
            $scope.updateBoardsList(data.data);
            boardFormData.reset();

            if (data.alerts[0].type == 'success') {
                $('.boardModal').modal('hide');
            }
        });
    };

    var checkFormInputs = function(boardFormData) {
        if ('' === boardFormData.name) {
            boardFormData.setAlert(true, false, false, 'Board name cannot be empty.');
            return false;
        }

        if (0 === boardFormData.lanes.length) {
            boardFormData.setAlert(false, true, false, 'At least one lane is required.');
            return false;
        }

        return true;
    };
}]);
