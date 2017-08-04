/* global expect ElementRefMock ContextMenuServiceMock SanitizerMock */
var path = '../../../../build/shared/context-menu/',
    ContextMenu = require(path + 'context-menu.component.js').ContextMenu;

describe('ContextMenu', () => {
    var contextMenu,
        contextMenuService,
        event = { preventDefault: () => {}, stopPropagation: () => {}};

    beforeEach(() => {
        contextMenuService = new ContextMenuServiceMock();
        contextMenu = new ContextMenu(ElementRefMock, contextMenuService, SanitizerMock);
    });

    it('has a function to get menu item text', () => {
        expect(contextMenu.getText({ text: 'testing' })).to.equal('testing');
    });

    it('has a function to call a callback', done => {
        var callback = () => {
            done();
        };

        contextMenu.callAction(event, callback);
    });

    it('captures the parent oncontextmenu event', done => {
        contextMenuService.closeAllCalled.subscribe( called => {
            expect(called).to.equal(true);
            done();
        });

        contextMenu.eventHandler({
            pageX: 10, pageY: 10,
            preventDefault: () => {},
            stopPropagation: () => {}
        });
    });
});

