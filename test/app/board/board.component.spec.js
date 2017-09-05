/* global expect RxJs TitleMock RouterMock ActivatedRouteMock AuthServiceMock BoardServiceMock StringsServiceMock */
var path = '../../../build/board/',
    BoardDisplay = require(path + 'board.component.js').BoardDisplay;

describe('BoardDisplay', () => {
    var board,
        title,
        router,
        dragula = {
            find: () => {},
            setOptions: () => {},
            dropModel: RxJs.Observable.of([
                null, {id: 1},
                { parentNode: { id: 1} },
                { parentNode: { id: 1} }
            ])
        };

    beforeEach(() => {
        title = new TitleMock();
        router = new RouterMock();

        board = new BoardDisplay(title, router, ActivatedRouteMock,
                                 AuthServiceMock, BoardServiceMock,
                                 null, null, StringsServiceMock, dragula);
    });

    it('sets the title when constructed', () => {
        expect(title.getTitle()).to.equal('TaskBoard - Kanban App');
    });

    it('implements ngOnOnit', () => {
        board.boardNavId = '0';
        board.ngOnInit();
        expect(board.boardNavId).to.equal('0');

        board.boardNavId = null;
        board.ngOnInit();
        expect(board.boardNavId).to.equal(null);

        board.activeUser = { default_board_id: '2' };
        board.ngOnInit();

        expect(board.boardNavId).to.equal('2');
        expect(router.path).to.equal('/boards/2');
    });

    it('implements ngAfterContentInit', () => {
        board.activeBoard = { columns: [{ id: 1, tasks: [{ id: 0 }] }] };

        board.ngAfterContentInit();
    });

    it('has a function to check for boards', () => {
        expect(board.noBoards()).to.equal(false);

        board.loading = false;
        board.boards = [];

        expect(board.noBoards()).to.equal(true);
    });

    it('has a function to navigate to a board', () => {
        board.boardNavId = null;
        board.goToBoard();

        board.boardNavId = 1;
        board.goToBoard();

        expect(router.path).to.equal('/boards/1');
    });

    it('has a function to toggle display of filtered tasks', () => {
        board.hideFiltered = true;
        board.activeBoard = {
            columns: [{ tasks: [{ id: 1 }] }]
        };

        board.toggleFiltered();
        expect(board.activeBoard.columns[0].tasks[0].hideFiltered)
            .to.equal(true);
    });

    it('has a function to filter tasks', () => {
        board.activeBoard = {
            columns: [
                { tasks: [{ id: 1, assignees: [], categories: [] }] }
            ]
        };

        board.userFilter = -1;
        board.categoryFilter = -1;
        board.filterTasks();

        expect(board.activeBoard.columns[0].tasks[0].filtered)
            .to.equal(false);

        board.userFilter = 1;
        board.categoryFilter = 1;
        board.activeBoard.columns[0].tasks[0].assignees = [{ id: 1 }];
        board.activeBoard.columns[0].tasks[0].categories = [{ id: 1 }];
        board.filterTasks();

        expect(board.activeBoard.columns[0].tasks[0].filtered)
            .to.equal(false);

        board.activeBoard.columns[0].tasks[0].assignees = [{ id: 2 }];
        board.activeBoard.columns[0].tasks[0].categories = [{ id: 2 }];
        board.filterTasks();

        expect(board.activeBoard.columns[0].tasks[0].filtered)
            .to.equal(true);
    });

    it('has a function to update the active board', () => {
        board.boardNavId = 1;
        board.boards = [{ id: 1, name: 'test' }];

        board.updateActiveBoard();

        expect(board.pageName).to.equal('test');
    });
});

