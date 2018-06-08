import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

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

  @Output()
  clickEvent: EventEmitter<MouseEvent> = new EventEmitter();

  constructor(private el: ElementRef) {
    const elem = el.nativeElement;

    elem.onclick = (event) => {
      if (this.isSeparator) {
        this.killEvent(event);
        return;
      }

      this.clickEvent.next(event);
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

