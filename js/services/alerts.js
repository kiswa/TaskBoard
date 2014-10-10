taskBoardServices.factory('AlertService',[
function() {
    var showNotyAlert = function(alert) {
        // Assumes noty.js is loaded
        noty({
            layout: 'bottom',
            type: alert.type,
            text: alert.text,
            timeout: 5000
        });
    };

    return {
        showAlert: function(alert) {
            if (undefined === alert) {
                return;
            }
            showNotyAlert(alert);
        },
        showAlerts: function(alerts) {
            if (undefined === alerts || !alerts.length) {
                return;
            }
            alerts.forEach(function(alert) {
                showNotyAlert(alert);
            });
        }
    };
}]);
