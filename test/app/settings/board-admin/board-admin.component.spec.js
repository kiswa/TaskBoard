/* global expect AuthServiceMock SettingsServiceMock BoardAdminServiceMock
    ModalServiceMock NotificationsServiceMock */
var dirs = '../../../../',
    path = dirs + 'build/settings/board-admin/',
    pathDrag = dirs + 'node_modules/ng2-dragula/components/',
    BoardAdmin = require(path + 'board-admin.component.js').BoardAdmin,
    DragulaService = require(pathDrag + 'dragula.provider.js').DragulaService;

describe('BoardAdmin', () => {
    var boardAdmin,
        modalService;

    beforeEach(() => {
        modalService = new ModalServiceMock();

        boardAdmin = new BoardAdmin(AuthServiceMock, modalService,
            new SettingsServiceMock(), new BoardAdminServiceMock(),
            new NotificationsServiceMock(), new DragulaService());
    });

    it('has a function to get a color', () => {
        var color = boardAdmin.getColor({ defaultColor: 'test' });
        expect(color).to.equal('test');
    });

    it('implements ngAfterContentInit', () => {
        expect(boardAdmin.ngAfterContentInit).to.be.a('function');

        try {
            // Dragula throws when trying to subscribe to an event.
            // This is just a cheap way to get a little more coverage.
            boardAdmin.ngAfterContentInit();
        } catch (ex) {
            // Ignore errors
        }
    });

    it('fails to add an invalid board', done => {
        boardAdmin.addEditBoard();

        setTimeout(() => {
            expect(boardAdmin.boards.length).to.equal(2);
            done();
        }, 10);
    });

    it('allows a board to be added', done => {
        boardAdmin.modalProps.title = 'Add';
        boardAdmin.modalProps.name = 'tester';
        boardAdmin.modalProps.columns = [{
            id: 0,
            name: 'Column 1',
            position: 0,
            board_id: 0,
            tasks: []
        }];

        boardAdmin.addEditBoard();

        setTimeout(() => {
            expect(boardAdmin.boards.length).to.equal(3);
            done();
        }, 10);
    });

    it('allows a board to be edited', done => {
        boardAdmin.modalProps.title = 'Edit';
        boardAdmin.modalProps.name = 'tester';
        boardAdmin.modalProps.columns = [{
            id: 0,
            name: 'Column 1',
            position: 0,
            board_id: 0,
            tasks: []
        }];

        boardAdmin.addEditBoard();

        setTimeout(() => {
            expect(boardAdmin.boards.length).to.equal(2);
            done();
        }, 10);
    });

    it('allows a board to be removed', done => {
        boardAdmin.boardToRemove = {
            id: 2,
            name: 'test',
            is_active: true,
            columns: [{
                id: 2,
                name: 'Column 1',
                position: 0,
                board_id: 2,
                tasks: []
            }],
            categories: [],
            issue_trackers: [],
            users: []
        };

        boardAdmin.removeBoard();

        setTimeout(() => {
            expect(boardAdmin.boards.length).to.equal(1);
            done();
        }, 10);
    });

    it('can toggle the active status of a board', done => {
        boardAdmin.toggleBoardStatus({
            id: 1,
            name: '',
            is_active: false,
            columns: [],
            categories: [],
            issue_trackers: [],
            users: []
        });

        setTimeout(() => {
            expect(boardAdmin.boards.length).to.equal(2);
            done();
        });
    });

    it('captures Enter key events', () => {
        var stopCalled = false,
            eventStop = {
                stopPropagation: () => {
                    stopCalled = true;
                }
            };

        boardAdmin.cancelEnterKey(eventStop);
        expect(stopCalled).to.equal(true);
    });

    it('sorts boards for display', () => {
        var filters = [ 'name-asc', 'name-desc', 'id-desc', 'id-asc' ];

        filters.forEach(filter => {
            boardAdmin.sortFilter = filter;
            boardAdmin.sortBoards();
        });
    });

    it('filters the list of display boards by user', () => {
        boardAdmin.userFilter = 1;

        var boards = boardAdmin.filterBoardsByUser();

        expect(boards.length).to.equal(1);
    });

    it('filters the list of display boards by status', () => {
        boardAdmin.statusFilter = 1;

        var boards = boardAdmin.filterBoardsByStatus();

        expect(boards.length).to.equal(1);
    });

    it('displays a modal for adding or editing a board', () => {
        boardAdmin.showModal('Add');
        expect(boardAdmin.users[0].selected).to.equal(false);

        var editBoard = {
            id: 1,
            name: 'test',
            columns: [],
            categories: [],
            issue_trackers: [],
            users: []
        };

        boardAdmin.showModal('Edit', editBoard);
        expect(boardAdmin.modalProps.id).to.equal(1);
    });
});

