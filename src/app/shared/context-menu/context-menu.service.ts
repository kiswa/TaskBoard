import { Injectable } from '@angular/core';

import { ContextMenu } from './context-menu.component';

@Injectable()
export class ContextMenuService {
  private menus: Array<ContextMenu> = [];

  constructor() {
    document.addEventListener('click', event => { this.closeAllMenus(); });
  }

  registerMenu(newMenu: ContextMenu) {
    const index = this.menus.indexOf(newMenu);

    if (index === -1) {
      this.menus.push(newMenu);
      return;
    }

    this.menus[index] = newMenu;
  }

  closeAllMenus() {
    this.menus.forEach(menu => {
      menu.isOpen = false;
    });
  }
}

