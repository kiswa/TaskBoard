import {
    Component,
    Input,
    ElementRef
} from '@angular/core';

import { ContextMenuItem } from './context-menu-item.model';

@Component({
    selector: 'tb-context-menu',
    templateUrl: 'app/shared/context-menu/context-menu.component.html'
})
export class ContextMenu {
    @Input('menu-items') menuItems: Array<ContextMenuItem>;

    isOpen = false;
    animate = true;

    constructor(private el: ElementRef) {
        let parentElement = el.nativeElement.parentElement;

        el.nativeElement.ownerDocument.addEventListener('click', () => {
            this.isOpen = false;
        });

        parentElement.oncontextmenu = (event: MouseEvent) => {
            event.preventDefault();
            this.onParentContextMenu(event);
        };
    }

    private onParentContextMenu(event: MouseEvent) {
        this.isOpen = true;

        let edgeBuffer = 10;
        let target = this.el.nativeElement.firstElementChild;

        setTimeout(() => {
            let rect = target.getBoundingClientRect();

            let offsetX = (event.pageX + rect.width + edgeBuffer) > window.innerWidth;
            let offsetY = (event.pageY + rect.height + edgeBuffer) > window.innerHeight;

            target.style.left = event.pageX - (offsetX ? rect.width : 0) + 'px';
            target.style.top = event.pageY - (offsetY ? rect.height : 0) + 'px';
        }, 10);
    }
}

