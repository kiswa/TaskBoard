// Used for loading third-party JS (like jQueryUI sortable) after
// all elements have been loaded into the DOM.
taskBoardDirectives.directive('onLoadCallback', function() {
    return {
        restrict: 'A',
        terminal: true,
        scope: {
            callback: '=onLoadCallback'
        },
        link: function(scope, element, attrs) {
            scope.callback();
        }
    };
});
