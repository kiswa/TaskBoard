taskBoardControllers.controller('BoardFormSettingsCtrl',
['$scope', 'BoardService',
function ($scope, BoardService) {
    var defaultColor = '#ffffe0';

    $scope.boardFormData = {
        setFocus: false,
        boardId: 0,
        isAdd: true,
        name: '',
        lanes: [],
        laneName: '',
        categories: [],
        categoryName: '',
        color: defaultColor,
        users: [],
        nameError: false,
        lanesError: false,
        categoriesError: false,
        trackers: [],
        trackerName: '',
        bugexpr: '',
        trackersError: false,
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
                        name: cat.name,
                        color: cat.color
                    });
                });
            }
            if (undefined !== board.ownTracker) {
                board.ownTracker.forEach(function(trac) {
                    that.trackers.push({
                        id: trac.id,
                        name: trac.name,
                        bugexpr: trac.bugexpr
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
                this.setAlert(false, true, false, false, 'Column  name cannot be empty.');
                return;
            }

            var that = this;
            this.lanes.forEach(function(lane) {
                if (that.laneName == lane.name) {
                    that.setAlert(false, true, false, false, 'That column name has already been added.');
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
                this.setAlert(false, false, true, false, 'Category name cannot be empty.');
                return;
            }

            var that = this;
            this.categories.forEach(function(category) {
                if (that.categoryName == category) {
                    this.setAlert(false, false, true, false, 'That category name has already been added.');
                }
            });

            // Add the new category (if no error) and reset the input.
            if (!this.categoriesError) {
                this.categories.push({
                    id: 0,
                    name: this.categoryName,
                    color: this.color
                });
            }
            this.categoryName = '';
        },
        removeCategory: function(category) {
            if (this.isSaving) { return; }
            this.categories.splice(this.categories.indexOf(category), 1);
        },
        addTracker: function() {
            this.trackersError = false;
            if (this.trackerName === '') {
                this.setAlert(false, false, false, true, 'Issue Tracker URL cannot be empty.');
                return;
            }
            if (this.bugexpr === '') {
                this.setAlert(false, false, false, true, 'Bug ID regular expression cannot be empty.');
                return;
            }
            var that = this;
            this.trackers.forEach(function(tracker) {
                if (that.trackerName == tracker) {
                    this.setAlert(false, false, false, true, 'That Issue Tracker URL has already been added.');
                }
            });

            // Add the new issue tracker (if no error) and reset the input.
            if (!this.trackersError) {
                this.trackers.push({
                    id: 0,
                    name: this.trackerName,
                    bugexpr: this.bugexpr
                });
            }
            this.trackerName = '';
            this.bugexpr = '';
        },
        removeTracker: function(tracker) {
            if (this.isSaving) { return; }
            this.trackers.splice(this.trackers.indexOf(tracker), 1);
        },
        setForSaving: function() {
            this.nameError = false;
            this.lanesError = false;
            this.categoriesError = false;
            this.trackersError = false;
            this.isSaving = true;
        },
        setAlert: function(name, lane, cat, trac, message) {
            this.nameError = name;
            this.lanesError = lane;
            this.categoriesError = cat;
            this.trackersError = trac;
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
            this.color = defaultColor;
            $('#spectrum').spectrum('enable');
            $scope.spectrum(defaultColor);
            this.users = [];
            this.nameError = false;
            this.lanesError = false;
            this.categoriesError = false;
            this.trackers = [];
            this.trackerName = '';
            this.bugexpr = '';
            this.trackersError = false;
            this.isSaving = false;
        },
        // Uses jQuery to close modal and reset form data.
        cancel: function() {
            $('.boardModal').modal('hide');
            $('#spectrum').spectrum('hide');
            $('#spectrum').spectrum('enable');
            var that = this;
            $('.boardModal').on('hidden.bs.modal', function (e) {
                that.reset();
            });
        }
    };
    $scope.$parent.boardFormData = $scope.boardFormData;

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
            preferredFormat: 'hex3'
        });
    };
    $scope.addBoard = function(boardFormData) {
        boardFormData.setForSaving();
        $('#spectrum').spectrum('disable');

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
        $('#spectrum').spectrum('disable');

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

    $scope.editedCategory = {};
    $scope.editColor = function(category) {
        if ($scope.editedCategory.id === undefined)
        {
            $scope.editedCategory.id = category.id;
            $scope.editedCategory.name = category.name;

            $scope.editedCategory.color = $scope.boardFormData.color;
            $scope.spectrum(category.color);
        }
        else if (($scope.editedCategory.id != category.id) &&
                ($scope.editedCategory.name != category.name))
        {
            $scope.spectrum()
            $scope.editedCategory = {};
        }
    };
    $scope.storeColor = function(e) {
        if (e.which === 13) { // Enter key
            $scope.boardFormData.categories.forEach(function(cat){
                if ((cat.id == $scope.editedCategory.id) &&
                   (cat.name == $scope.editedCategory.name))
                    cat.color = $scope.boardFormData.color;
            });
            $scope.spectrum();
            $scope.editedCategory = {};
        }
        else if (e.which === 27) { // Escape key
            $scope.spectrum();
	    $scope.editedCategory = {};
        }
    };


    var checkFormInputs = function(boardFormData) {
        if ('' === boardFormData.name) {
            boardFormData.setAlert(true, false, false, false, 'Board name cannot be empty.');
            return false;
        }

        if (0 === boardFormData.lanes.length) {
            boardFormData.setAlert(false, true, false, false, 'At least one lane is required.');
            return false;
        }

        return true;
    };
}]);
