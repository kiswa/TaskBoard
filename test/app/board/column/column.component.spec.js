/* global expect ElementRefMock AuthServiceMock NotificationsServiceMock StringsServiceMock BoardServiceMock ModalServiceMock */
var path = '../../../../build/board/column/',
    ColumnDisplay = require(path + 'column.component.js').ColumnDisplay;

describe('ColumnDisplay', () => {
    var column,
        modalService;

    beforeEach(() => {
        modalService = new ModalServiceMock();

        column = new ColumnDisplay(ElementRefMock, AuthServiceMock,
                                   new NotificationsServiceMock(),
                                   modalService, StringsServiceMock,
                                   BoardServiceMock);
    });

    it('has a context menu', () => {
        expect(column.contextMenuItems).to.be.an('array');
        expect(column.contextMenuItems.length).to.equal(1);
    });
});

