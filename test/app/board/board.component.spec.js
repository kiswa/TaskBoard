/* global expect TitleMock RouterMock ActivatedRouteMock AuthServiceMock BoardServiceMock */
var path = '../../../build/board/',
    BoardDisplay = require(path + 'board.component.js').BoardDisplay;

describe('BoardDisplay', () => {
    var board,
        title;

    beforeEach(() => {
        title = new TitleMock();

        board = new BoardDisplay(title, new RouterMock(), ActivatedRouteMock,
                                 AuthServiceMock, BoardServiceMock);
    });

    it('sets the title when contstructed', () => {
        expect(title.getTitle()).to.equal('TaskBoard - Kanban App');
    });
});

