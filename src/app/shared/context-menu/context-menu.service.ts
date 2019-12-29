import { Injectable } from '@angular/core';

import { ContextMenuComponent } from './context-menu.component';

@Injectable()
export class ContextMenuService {
  private menus: Array<ContextMenuComponent> = [];

  constructor() {
    document.addEventListener('click', _ => { this.closeAllMenus(); });
  }

  registerMenu(newMenu: ContextMenuComponent) {
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

