taskBoardControllers.controller('FilesCtrl',
['$scope', '$routeParams', '$http', '$window',
 'BoardService',
function ($scope, $routeParams, $http, $window, BoardService) {
    $scope.file = {
        id: $routeParams.fileId,
        loading: true
    };

    $http.get('api/items/1/upload/' + $scope.file.id)
    .success(function(data) {
        $scope.file.loading = false;
        if (data.data) {
            $scope.file.data = data.data[0];
            var date = new Date();
            date.setTime($scope.file.data.timestamp * 1000);
            $scope.file.data.date = date.toLocaleString();
            $scope.file.data.filename = 'api/uploads/' + $scope.file.data.filename;
        } else {
            $scope.file.error = true;
        }
    })
    .error(function(data) {
        $scope.file.loading = false;
        $scope.file.error = true;
    });
}]);
