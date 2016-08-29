/* global RxJs */
var MockBrowser = require('mock-browser').mocks.MockBrowser,
    mockBrowser = new MockBrowser(),
    chai = require('chai');

global.RxJs = require('rxjs/Rx');
global.expect = chai.expect;
global.document = mockBrowser.getDocument();
global.localStorage = mockBrowser.getLocalStorage();

global.Chartist = {
    Pie: function(id, data, opts) {
        this.sum = function() { return 100; };
    },
    Line: function(id, data, opts) {
        this.plugins = {
            tooltip: () => {}
        };
    }
};

global.ConstantsMock = {
    VERSION: 'TEST'
};

global.TitleMock = function() {
    var title = '';

    return {
        getTitle: () => {
            return title;
        },
        setTitle: (text) => {
            title = text;
        }
    };
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
    userOptions: {
        show_animations: false
    },
    userChanged: RxJs.Observable.of({
        id: 1,
        username: 'tester',
        default_board_id: 0,
        security_level: 2
    }),
    updateUser: (user) => {
    },
    login: () => {
        return RxJs.Observable.of({
            alerts: [ 'Logged in' ],
            status: 'success'
        });
    },
    logout: () => {
        return RxJs.Observable.of({
            alerts: [ 'Logged out' ]
        });
    },
    authenticate: () => {
        return false;
    }
};

global.NotificationsServiceMock = function() {
    var notes = new RxJs.Subject();

    return {
        noteAdded: notes.asObservable(),
        add: (note) => {
            notes.next(note);
        }
    };
};

global.ResponseMock = function(endpoint) {
    return {
        json: () => {
            return {
                alerts: [],
                data: [ 'jwt', 'true', 'true' ],
                status: 'success',
                endpoint: endpoint
            };
        }
    };
};

global.ModalServiceMock = function() {
    var closed = new RxJs.Subject(),
        opened = new RxJs.Subject(),
        register = new RxJs.Subject();

    return {
        closeCalled: closed.asObservable(),
        openCalled: opened.asObservable(),
        registerCalled: register.asObservable(),

        open: (id) => {
            opened.next(id);
        },
        close: () => {
            closed.next(true);
        },
        registerModal: () => {
            register.next(true);
        }
    };
};

global.SettingsServiceMock = function() {
    var userList = [
            { id: 1, username: 'tester', security_level: 2 },
            { id: 2, username: 'test', security_level: 3, default_board_id: 0 }
        ],
        boardsList = [
            { id: 1, name: 'Testing' }
        ];

    return {
        usersChanged: RxJs.Observable.of(userList),
        boardsChanged: RxJs.Observable.of(boardsList),

        updateUsers: (users) => {
            userList = users;
        },
        getUsers: () => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [ null, userList ]
            });
        },

        updateBoards: (boards) => {
            boardsList = boards;
        },
        getBoards: () => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [ null, boardsList ]
            });
        }
    };
};

global.UserAdminServiceMock = function() {
    var userList = [
            { id: 1, username: 'tester', security_level: 2 },
            { id: 2, username: 'test', security_level: 3, default_board_id: 0 }
        ];

    return {
        addUser: (user) => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [
                    null,
                    userList.concat(user)
                ]
            });
        },
        editUser: (user) => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [
                    null,
                    JSON.stringify({
                        id: 1,
                        username: 'changed',
                        security_level: 3
                    })
                ]
            });
        },
        removeUser: (userId) => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [
                    null,
                    userList.slice(1)
                ]
            });
        }
    };
};

global.UserSettingsServiceMock = {
    changeUserOptions: (opts) => {
        return RxJs.Observable.of({
            alerts: []
        });
    },
    changeUsername: (newName) => {
        return RxJs.Observable.of({
            alerts: [{ type: 'success', text: ''}]
        });
    },
    changePassword: (newPass) => {
        return RxJs.Observable.of({
            alerts: [{ type: 'success', text: ''}]
        });
    },
    changeEmail: (newEmail) => {
        return RxJs.Observable.of({
            alerts: [{ type: 'success', text: ''}]
        });
    }
};

global.HttpMock = {
    post: (url, data) => {
        var response = new global.ResponseMock(url);
        return RxJs.Observable.of(response);
    },
    get: (url) => {
        var response = new global.ResponseMock(url);
        return RxJs.Observable.of(response);
    },
    delete: (url) => {
        var response = new global.ResponseMock(url);
        return RxJs.Observable.of(response);
    }
};

