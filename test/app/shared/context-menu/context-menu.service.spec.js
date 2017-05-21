/* global expect */
var path = '../../../../build/shared/context-menu/',
    ContextMenuItem = require(path + 'context-menu-item.model.js').ContextMenuItem,
    ContextMenuService = require(path + 'context-menu.service.js').ContextMenuService;

describe('ContextMenu', () => {
    var contextMenuService;

    beforeEach(() => {
        contextMenuService = new ContextMenuService();
    });

    it('has a menus array', () => {
        expect(contextMenuService.menus).to.be.an('array');
    });

    it('has a registerMenu function', () => {
        contextMenuService.registerMenu(new ContextMenuItem());

        expect(contextMenuService.menus.length).to.equal(1);
    });

    it('has a closeAllMenus function', () => {
        contextMenuService.registerMenu({ isOpen: true });
        contextMenuService.closeAllMenus({});

        expect(contextMenuService.menus[0].isOpen).to.equal(false);
    });
});

