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
            if (undefined === alert || null === alert) {
                return;
            }
            showNotyAlert(alert);
        },
        showAlerts: function(alerts) {
            if (undefined === alerts || null === alerts || !alerts.length) {
                return;
            }
            alerts.forEach(function(alert) {
                showNotyAlert(alert);
            });
        }
    };
}]);
