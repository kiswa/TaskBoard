var RxJs = require('rxjs/Rx');

global.ConstantsMock = {
    VERSION: 'TEST'
};

global.RouterMock = function() {
    return {
        path: 'test',
        url: 'test',
        navigate: function(arr) {
            this.path = arr[0];
        }
    };
};

global.AuthServiceMock = {
    userChanged: RxJs.Observable.of({
        username: 'tester'
    }),
    logout: () => {
        return RxJs.Observable.of({
            alerts: [ 'Logged out' ]
        });
    },
    authenticate: () => {
        return false;
    }
};

global.NotificationMock = {
    note: '',
    add: (note) => {
        this.note = note;
    }
};

