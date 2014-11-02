taskBoardControllers.controller('ItemViewBoardCtrl',
['$scope', '$window', 'BoardService',
function ($scope, $window, BoardService) {
    $scope.viewItem = {};
    $scope.comment = {};
    $scope.toggle = {
        sidebar: false
    };
    $scope.fileReset = false;

    $scope.comments = {
        options: [
            {id: 0, text:'Oldest First'},
            {id: 1, text: 'Newest First'}
        ],
        sorting: 0
    };

    $scope.markedComment = function(text) {
        if (text) {
            return $window.marked(text);
        } else {
            return "<p>No text</p>";
        }
    };

    // Takes an array of timestamps and converts them to display dates.
    var convertDates = function(timestampArray) {
            if (undefined === timestampArray) {
                return;
            }

            var date = new Date();
            timestampArray.forEach(function(item) {
                date.setTime(item.timestamp * 1000);
                item.date = date.toLocaleString();
            });
        },
        updateItem = function(item) {
            $scope.viewItem = item;
            $scope.viewItem.laneName = $scope.laneNames[item.lane_id];
            convertDates($scope.viewItem.ownComment);
            convertDates($scope.viewItem.ownAttachment);
            convertDates($scope.viewItem.ownActivity);
        };

    $scope.openItem = function(item, openModal) {
        if (undefined === openModal) {
            openModal = true;
        }
        updateItem(item);
        $scope.viewItem.disabled = false;

        if (undefined === $scope.viewItem.ownComment) {
            $scope.viewItem.ownComment = [];
        }
        if (undefined === $scope.viewItem.ownAttachment) {
            $scope.viewItem.ownAttachment = [];
        }

        $scope.fileReset = true;

        if (openModal) {
            $('.itemViewModal').modal({ show: true, keyboard:false });
        }
    };
    $scope.$parent.openItem = $scope.openItem;

    $scope.editItem = function() {
        $scope.itemFormData.loadItem($scope.viewItem);
        $('.itemViewModal').modal('hide');
        $('.itemModal').modal('show');
    }

    $scope.deleteItem = function() {
        noty({
            text: 'Deleting an item cannot be undone.<br>Continue?',
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {
                    addClass: 'btn btn-default',
                    text: 'Ok',
                    onClick: function($noty) {
                        $noty.close();
                        $scope.viewItem.disabled = true;

                        BoardService.removeItem($scope.viewItem.id)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                            if (data.alerts[0].type == 'success') {
                                $scope.updateBoards(data);
                                $('.itemViewModal').modal('hide');
                            }
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
    $scope.$parent.deleteItem = $scope.deleteItem;

    $scope.deleteComment = function(commentId) {
        noty({
            text: 'Deleting a comment cannot be undone.<br>Continue?',
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {
                    addClass: 'btn btn-default',
                    text: 'Ok',
                    onClick: function($noty) {
                        $noty.close();

                        BoardService.removeItemComment($scope.viewItem.id, commentId)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                            if (data.alerts[0].type == 'success') {
                                updateItem(data.data[0]);
                            }
                            $scope.loadBoards();
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

    $scope.attachmentDeleting = [];
    $scope.deleteAttachment = function(fileId) {
        noty({
            text: 'Deleting an attachment cannot be undone.<br>Continue?',
            layout: 'center',
            type: 'information',
            modal: true,
            buttons: [
                {
                    addClass: 'btn btn-default',
                    text: 'Ok',
                    onClick: function($noty) {
                        $noty.close();
                        $scope.attachmentDeleting[fileId] = true;

                        BoardService.removeItemAttachment($scope.viewItem.id, fileId)
                        .success(function(data) {
                            $scope.alerts.showAlerts(data.alerts);
                            if (data.alerts[0].type == 'success') {
                                updateItem(data.data[0]);
                            }
                            $scope.loadBoards();
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

    $scope.addItemComment = function(comment) {
        if (comment === "" || undefined === comment) {
            $scope.alerts.showAlert({ type: 'error', text: 'Comment cannot be empty.' });
            return;
        }

        $scope.viewItem.disabled = true;
        BoardService.addItemComment($scope.viewItem.id, comment)
        .success(function(data) {
            updateItem(data.data[0]);
            $scope.loadBoards();
            $scope.viewItem.disabled = false;
        });
        // Reset input
        $scope.comment.text = "";
    };

    $scope.beginEditComment = function(commentId, comment) {
        $scope.comment.isEdit = true;
        $scope.comment.editText = comment;
        $scope.comment.id = commentId;
    };

    $scope.editComment = function(commentId, comment) {
        $scope.comment.isEdit = false;
        if (comment === '' || undefined === comment) {
            $scope.alerts.showAlert({ type: 'error', text: 'Comment cannot be empty.' });
            return;
        }

        $scope.viewItem.disabled = true;
        BoardService.updateItemComment(commentId, comment)
        .success(function(data) {
            updateItem(data.data[0]);
            $scope.loadBoards();
            $scope.viewItem.disabled = false;
        });
    };

    $scope.addItemAttachment = function() {
        if ($scope.itemUpload === undefined || $scope.itemUpload.name === '') {
            $scope.alerts.showAlert({ type: 'error', text: 'Select a file before uploading.' });
            return;
        }

        $scope.viewItem.disabled = true;
        BoardService.addItemAttachment($scope.viewItem.id, $scope.itemUpload)
        .success(function(data) {
            updateItem(data.data[0]);
            $scope.loadBoards();
            $scope.viewItem.disabled = false;
            // Reset input
            $scope.fileReset = true;
        })
        .error(function(data) {
            $scope.viewItem.disabled = false;
            $scope.fileReset = true;
            console.log(data);
            $scope.alerts.showAlert({ type: 'error', text: 'There was an error with your attachment. ' +
                                                           'The file may be too large.' });
        });
    };
}]);
