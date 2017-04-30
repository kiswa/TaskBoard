import { Component, Input } from '@angular/core';

import { ContextMenuItem } from './context-menu-item.model';

@Component({
    selector: 'tb-context-menu',
    templateUrl: 'app/shared/context-menu/context-menu.component.html'
})
export class ContextMenu {
    @Input('menu-items') menuItems: Array<ContextMenuItem>;

    isOpen = false;
    animate = true;

    constructor() {
        // TODO
    }
}

