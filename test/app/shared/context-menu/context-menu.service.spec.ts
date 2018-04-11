import {
  ContextMenuService
} from '../../../../src/app/shared/context-menu/context-menu.service';

describe('ContextMenuService', () => {
  let service: ContextMenuService;

  beforeEach(() => {
    service = new ContextMenuService();
  });

  it('can be constructed', () => {
    expect(service).toBeTruthy();
  });

  it('can have a menu registered', () => {
    service.registerMenu(<any>{});

    expect(service['menus'].length).toEqual(1);
  });

  it('has a way to close all menus', () => {
    service.registerMenu(<any>{ isOpen: true });
    service.closeAllMenus();

    expect(service['menus'][0].isOpen).toEqual(false);
  });

  it('closes all menus on document click', () => {
    service.registerMenu(<any>{ isOpen: true });
    document.body.click();

    expect(service['menus'][0].isOpen).toEqual(false);
  });

});

