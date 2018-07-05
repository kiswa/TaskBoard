import { Component, ElementRef, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'tb-context-menu-item',
  templateUrl: './context-menu-item.component.html',
  styles: [`:host {
    cursor: pointer;
    display: block;
    padding: 4px 10px;
    user-select: none;

    :hover:not([ng-reflect-is-separator]) {
      background-color: lighten($color-background, 5%);
    }
  }`]
})
export class ContextMenuItem {
  @Input()
  isSeparator: boolean;

  @Input()
  isCustomEvent: boolean;

  constructor(public el: ElementRef) {
    const elem = el.nativeElement;

    elem.onclick = (event) => {
      if (this.isSeparator || this.isCustomEvent) {
        this.killEvent(event);
        return;
      }
    };

    elem.oncontextmenu = (event) => {
      this.killEvent(event);
    }
  }

  private killEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  }

}

