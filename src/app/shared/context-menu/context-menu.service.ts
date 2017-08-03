import { Injectable } from '@angular/core';

import { ContextMenu } from './context-menu.component';

@Injectable()
export class ContextMenuService {
    private menus: Array<ContextMenu>;

    constructor() {
        this.menus = [];

        document.addEventListener('click', event => {
            this.closeAllMenus();
        });
    }

    registerMenu(newMenu: ContextMenu) {
        this.menus.push(newMenu);
    }

    closeAllMenus() {
        this.menus.forEach(menu => {
            menu.isOpen = false;
        });
    }
}

