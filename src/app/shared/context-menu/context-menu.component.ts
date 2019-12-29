import { Component, ElementRef } from '@angular/core';

import { ContextMenuService } from './context-menu.service';

@Component({
  selector: 'tb-context-menu',
  templateUrl: './context-menu.component.html'
})
export class ContextMenuComponent {
  public isOpen = false;

  constructor(public el: ElementRef,
              private menuService: ContextMenuService) {
    menuService.registerMenu(this);

    const parentEl = el.nativeElement.parentElement;

    if (!parentEl) {
      return;
    }

    parentEl.oncontextmenu = (event: MouseEvent) => {
      this.parentEventHandler(event);

      setTimeout(() => {
        this.updatePosition(event);
      }, 0);
    };
  }

  private updatePosition(event: MouseEvent) {
    const edgeBuffer = 10;

    // Adjust position if near an edge
    const target = this.el.nativeElement.firstElementChild;

    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const offsetX = (event.pageX + rect.width + edgeBuffer) > window.innerWidth;
    const offsetY = (event.pageY + rect.height + edgeBuffer) > window.innerHeight;

    target.style.left = event.pageX - (offsetX ? rect.width : 0) + 'px';
    target.style.top = event.pageY - (offsetY ? rect.height : 0) + 'px';
  }

  private parentEventHandler(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.menuService.closeAllMenus();
    this.isOpen = true;
  }
}

