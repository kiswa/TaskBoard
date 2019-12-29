import { Component, ElementRef, Input } from '@angular/core';

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
export class ContextMenuItemComponent {
  @Input()
  isSeparator: boolean;

  @Input()
  isCustomEvent: boolean;

  constructor(public el: ElementRef) {
    const elem = el.nativeElement;

    elem.onclick = (event: any) => {
      if (this.isSeparator || this.isCustomEvent) {
        this.killEvent(event);
        return;
      }
    };

    elem.oncontextmenu = (event: any) => {
      this.killEvent(event);
    };
  }

  private killEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

}

