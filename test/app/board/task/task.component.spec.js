/* global expect AuthServiceMock SanitizerMock NotificationsServiceMock BoardServiceMock ModalServiceMock */
var path = '../../../../build/board/task/',
    TaskDisplay = require(path + 'task.component.js').TaskDisplay;

describe('TaskDisplay', () => {
    var task,
        modalService;

    beforeEach(() => {
        modalService = new ModalServiceMock();

        task = new TaskDisplay(AuthServiceMock, SanitizerMock,
                               BoardServiceMock, modalService,
                               new NotificationsServiceMock(),
                               StringsServiceMock);
    });

    it('has a context menu', () => {
        expect(task.contextMenuItems).to.be.an('array');
        expect(task.contextMenuItems.length).to.equal(0);
    });
});


