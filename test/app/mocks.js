/* global RxJs */

var MockBrowser = require('mock-browser').mocks.MockBrowser,
    mockBrowser = new MockBrowser(),
    chai = require('chai'),
    users = [
        {
            id: '1',
            default_board_id: '0',
            username: 'tester',
            security_level: '2',
            user_option_id: '0',
            board_access: []
        },
        {
            id: '2',
            default_board_id: '0',
            username: 'test',
            security_level: '3',
            user_option_id: '0',
            board_access: []
        }
    ],
    boards = [
        {
            id: 1,
            name: 'testing',
            is_active: true,
            columns: [{
                id: 1,
                name: 'Column 1',
                position: 0,
                board_id: 1,
                tasks: []
            }],
            categories: [{
                id: 1,
                name: 'Category 1'
            }],
            issue_trackers: [],
            users: [ users[1] ]
        },
        {
            id: 2,
            name: 'test',
            is_active: false,
            columns: [{
                id: 2,
                name: 'Column 1',
                position: 0,
                board_id: 2,
                tasks: []
            }],
            categories: [],
            issue_trackers: [],
            users
        }
    ],
    actions = [
        {
            id: 1,
            trigger: 1,
            source_id: 1,
            type: 1,
            change_to: 'test',
            board_id: 1
        },
        {
            id: 2,
            trigger: 2,
            source_id: 2,
            type: 2,
            change_to: 'testing',
            board_id: 2
        }
];

global.window = mockBrowser.getWindow();
global.document = mockBrowser.getDocument();
global.navigator = mockBrowser.getNavigator();
global.localStorage = mockBrowser.getLocalStorage();

require('reflect-metadata');
global.window.Reflect = Reflect;

global.RxJs = require('rxjs/Rx');
global.expect = chai.expect;

global.ElementRefMock = {
    nativeElement: {
        parentElement: {
            oncontextmenu: () => {}
        },
        classList: {
            add: () => {},
            remove: () => {},
            toggle: () => {}
        },
        firstElementChild: {
            style: {},
            getBoundingClientRect: () => {
                return {
                    width: 10,
                    height: 10
                };
            }
        }
    }
};

global.Chartist = {
    Pie(id, data, opts) {
        this.sum = function() { return 100; };
    },
    Line(id, data, opts) {
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
        setTitle: text => {
            title = text;
        }
    };
};

global.RouterMock = function() {
    return {
        path: 'test',
        url: 'test',
        navigate(arr) {
            this.path = arr[0];
        }
    };
};

global.ActivatedRouteMock = {
    params: RxJs.Observable.of({})
};

global.AuthServiceMock = {
    userOptions: {
        show_animations: false
    },
    userChanged: RxJs.Observable.of(users[0]),
    updateUser: user => {
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
        return RxJs.Observable.of(true);
    }
};

global.NotificationsServiceMock = function() {
    var notes = new RxJs.Subject();

    return {
        noteAdded: notes.asObservable(),
        add: note => {
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
                endpoint
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

        open: id => {
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

global.ContextMenuServiceMock = function() {
    var register = new RxJs.Subject(),
        closeAll = new RxJs.Subject();

    return {
        registerCalled: register.asObservable(),
        closeAllCalled: closeAll.asObservable(),

        registerMenu: () => {
            register.next(true);
        },
        closeAllMenus: () => {
            closeAll.next(true);
        }
    };
};

global.StringsServiceMock = {
    stringsChanged: {
        subscribe(callback) {
            callback({
                settings: 'Settings'
            });
        }
    },
    loadStrings() {}
};

global.SettingsServiceMock = function() {
    var userList = new RxJs.BehaviorSubject(users),
        boardList = new RxJs.BehaviorSubject(boards),
        actionList = new RxJs.BehaviorSubject(actions);

    return {
        usersChanged: userList.asObservable(),
        boardsChanged: boardList.asObservable(),
        actionsChanged: actionList.asObservable(),

        updateUsers: users => {
            userList.next(users);
        },
        getUsers: () => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [ null, users ]
            });
        },

        updateBoards: boards => {
            boardList.next(boards);
        },
        getBoards: () => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [ null, boards ]
            });
        },

        updateActions: actions => {
            actionList.next(actions);
        },
        getActions: () => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [ null, actions ]
            });
        }
    };
};

global.UserAdminServiceMock = function() {
    var userList = users.slice();

    return {
        addUser: user => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [
                    null,
                    userList.concat(user)
                ]
            });
        },
        editUser: user => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [
                    null,
                    JSON.stringify(userList[1]),
                    userList
                ]
            });
        },
        removeUser: userId => {
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

global.BoardAdminServiceMock = function() {
    return {
        addBoard: board => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [
                    null,
                    boards.concat(board)
                ]
            });
        },
        editBoard: board => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [
                    null,
                    boards
                ]
            });
        },
        removeBoard: boardId => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [
                    null,
                    boards.slice(1)
                ]
            });
        }
    };
};

global.AutoActionsServiceMock = function() {
    return {
        addAction: action => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [
                    null,
                    actions.concat(action)
                ]
            });
        },
        removeAction: boardId => {
            return RxJs.Observable.of({
                status: 'success',
                alerts: [],
                data: [
                    null,
                    actions.slice(1)
                ]
            });
        }
    };
};

global.UserSettingsServiceMock = {
    changeUserOptions: opts => {
        return RxJs.Observable.of({
            alerts: []
        });
    },
    changeDefaultBoard: boardId => {
        return RxJs.Observable.of({
            alerts: [{ type: 'success', text: '' }],
            data: [ '', '{}' ]
        });
    },
    changeUsername: newName => {
        return RxJs.Observable.of({
            alerts: [{ type: 'success', text: '' }]
        });
    },
    changePassword: newPass => {
        return RxJs.Observable.of({
            alerts: [{ type: 'success', text: '' }]
        });
    },
    changeEmail: newEmail => {
        return RxJs.Observable.of({
            alerts: [{ type: 'success', text: '' }]
        });
    }
};

global.BoardServiceMock = {
    getBoards: () => {
        return RxJs.Observable.of({
            data: [ '', [{
                id: 1, name: 'test', is_active: '1',
                ownColumn: [], ownCategory: [],
                ownAutoAction: [], ownIssuetracker: [],
                sharedUser: []
            }] ]
        });
    },
    updateColumn: () => {
        return RxJs.Observable.of({
            status: 'success',
            alerts: [],
            data: ['', [{
                id: 1, name: 'test', position: 1,
                board_id: 1, task_limit: 3, ownTask: []
            }]]
        });
    },
    toggleCollapsed: () => {
        return RxJs.Observable.of({ data: [ '', [1]] });
    },
    addTask: () => {
        return RxJs.Observable.of({
            status: 'success',
            alerts: [],
            data: ['', '', [{ ownColumn: [{}] }] ]
        });
    },
    updateTask: () => {
        return RxJs.Observable.of({
            status: 'success',
            alerts: [],
            data: ['', '', [{}]]
        });
    },
    removeTask: () => {
        return RxJs.Observable.of({
            status: 'success',
            alerts: [],
            data: ['', [{}]]
        });
    },
    activeBoardChanged: RxJs.Observable.of({ name: 'Kanban App', columns: [] }),
    updateActiveBoard: () => {},
    refreshToken: () => {}
};

global.HttpMock = {
    post: (url, data) => {
        var response = new global.ResponseMock(url);
        return RxJs.Observable.of(response);
    },
    get: url => {
        var response = new global.ResponseMock(url);
        return RxJs.Observable.of(response);
    },
    delete: url => {
        var response = new global.ResponseMock(url);
        return RxJs.Observable.of(response);
    }
};

global.SanitizerMock = {
    bypassSecurityTrustHtml: html => {
        return html;
    },
    bypassSecurityTrustStyle: css => {
        return css;
    }
};


