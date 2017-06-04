/* global expect TitleMock RouterMock ActivatedRouteMock AuthServiceMock BoardServiceMock */
var path = '../../../build/board/',
    BoardDisplay = require(path + 'board.component.js').BoardDisplay;

describe('BoardDisplay', () => {
    var board,
        title,
        router;

    beforeEach(() => {
        title = new TitleMock();
        router = new RouterMock();

        board = new BoardDisplay(title, router, ActivatedRouteMock,
                                 AuthServiceMock, BoardServiceMock);
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
        board.goToBoard();
        expect(board.boardNavId).to.equal(null);

        board.activeUser = { default_board_id: '2' };
        board.ngOnInit();

        expect(board.boardNavId).to.equal('2');
        expect(router.path).to.equal('/boards/2');
    });

    it('has a function to check for boards', () => {
        expect(board.noBoards()).to.equal(true);

        board.loading = false;
        board.boards = [{}];

        expect(board.noBoards()).to.equal(false);
    });
});

