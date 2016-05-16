taskBoardServices.factory('BoardService',
['$http',
function($http) {
    return {
        getBoards: function() {
            return $http.get('api/boards');
        },

        removeBoard: function(boardId) {
            return $http.post('api/boards/remove', {
                boardId: boardId
            });
        },

        addBoard: function(boardData) {
            return $http.post('api/boards', {
                name: boardData.name,
                lanes: boardData.lanes,
                categories: boardData.categories,
                trackers: boardData.trackers,
                users: boardData.users
            });
        },

        editBoard: function(boardData) {
            return $http.post('api/boards/update', {
                boardId: boardData.boardId,
                name: boardData.name,
                lanes: boardData.lanes,
                categories: boardData.categories,
                trackers: boardData.trackers,
                users: boardData.users
            });
        },

        toggleLane: function(laneId) {
            return $http.post('api/lanes/' + laneId + '/toggle');
        },

        toggleActiveState: function(boardId) {
            return $http.post('api/boards/' + boardId + '/toggleActive');
        },

        getAutoActions: function() {
            return $http.get('api/autoactions');
        },

        addAutoAction:  function(action) {
            return $http.post('api/autoactions', {
                boardId: action.board,
                triggerId: action.trigger,
                secondaryId: action.secondary,
                actionId: action.action,
                color: action.color,
                categoryId: action.category,
                assigneeId: action.assignee
            });
        },

        removeAutoAction: function(actionId) {
            return $http.post('api/autoactions/remove', {
                actionId: actionId
            });
        },

        addItem: function(itemData, boardId) {
            return $http.post('api/boards/' + boardId + '/items', {
                title: itemData.title,
                description: itemData.description,
                assignee: itemData.assignee,
                category: itemData.category,
                color: itemData.color,
                dueDate: itemData.dueDate,
                points: itemData.points,
                lane: itemData.lane
            });
        },

        updateItem: function(itemData) {
            return $http.post('api/items/' + itemData.itemId, {
                title: itemData.title,
                description: itemData.description,
                assignee: itemData.assignee,
                category: itemData.category,
                color: itemData.color,
                dueDate: itemData.dueDate,
                points: itemData.points,
                lane: itemData.lane,
                position: itemData.position
            });
        },

        updateItemPositions: function(positionArray) {
            return $http.post('api/items/positions', {
                positions: positionArray
            });
        },

        removeItem: function(itemId) {
            return $http.post('api/items/remove', {
                itemId: itemId
            });
        },

        addItemComment: function(itemId, comment) {
            return $http.post('api/items/' + itemId + '/comment', {
                text: comment
            });
        },

        updateItemComment: function(commentId, comment) {
            return $http.post('api/comments/' + commentId, {
                text: comment
            });
        },

        removeItemComment: function(itemId, commentId) {
            return $http.post('api/items/' + itemId + '/comment/remove', {
                id: commentId
            });
        },

        addItemAttachment: function(itemId, file) {
            var fd = new FormData();
            fd.append('file', file);

            return $http.post('api/items/' + itemId + '/upload', fd, {
                // Just pass the data, don't serialize.
                transformRequest: angular.identity,
                // Let browser handle Content-Type.
                headers: { 'Content-Type': undefined }
            });
        },

        removeItemAttachment: function(itemId, fileId) {
            return $http.post('api/items/' + itemId + '/upload/remove', {
                fileId: fileId
            });
        }
    };
}]);
