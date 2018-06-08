import { Component, ElementRef } from '@angular/core';

import { ContextMenuService } from './context-menu.service';

@Component({
  selector: 'tb-context-menu',
  templateUrl: './context-menu.component.html'
})
export class ContextMenu {
  public isOpen = false;

  constructor(public el: ElementRef,
              private menuService: ContextMenuService) {
    menuService.registerMenu(this);

    const parentEl = el.nativeElement.parentElement;

    parentEl.oncontextmenu = (event: MouseEvent) => {
      this.parentEventHandler(event);
    };
  }

  private parentEventHandler(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.menuService.closeAllMenus();
    this.el.nativeElement.style.top = '-10000px';
    this.isOpen = true;

    const edgeBuffer = 10;

    // Adjust position if near an edge
    const adjustPosition = () => {
      const target = this.el.nativeElement.firstElementChild;
      const rect = target.getBoundingClientRect();
      const offsetX = (event.pageX + rect.width + edgeBuffer) > window.innerWidth;
      const offsetY = (event.pageY + rect.height + edgeBuffer) > window.innerHeight;

      target.style.left = event.pageX - (offsetX ? rect.width : 0) + 'px';
      target.style.top = event.pageY - (offsetY ? rect.height : 0) + 'px';
    };

    setTimeout(adjustPosition, 0);
  }
}

