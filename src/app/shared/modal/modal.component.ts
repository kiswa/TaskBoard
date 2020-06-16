import {
  Component,
  Input,
  OnInit,
  ContentChild
} from '@angular/core';
import { Location } from '@angular/common';

import { ModalService } from './modal.service';

@Component({
  selector: 'tb-modal',
  templateUrl: './modal.component.html',
  // tslint:disable-next-line
  host: {
    '(document:keyup.enter)': 'keyup($event)',
    '(document:keyup.escape)': 'keyup($event)'
  }
})
export class ModalComponent implements OnInit {
  // tslint:disable-next-line
  @Input('modal-id') modalId = '';
  // tslint:disable-next-line
  @Input('modal-title') modalTitle = '';
  @Input() blocking = false;
  @Input() wide = false;

  @ContentChild('focusMe', { static: false }) focusElement: any;
  @ContentChild('defaultAction', { static: false }) defaultActionElement: any;

  isOpen = false;
  animate = true;

  constructor(public modalService: ModalService, private location: Location) {
  }

  ngOnInit() {
    this.modalService.registerModal(this);
  }

  close(checkBlocking = false): void {
    this.modalService.close(this.modalId, checkBlocking);

    const path = this.location.path().split('/');
    path.length -= 1;

    this.location.go(path.join('/'))
  }

  filterClick(event: Event): void {
    // tslint:disable-next-line
    event = event || window.event;

    // Prevent click from propagating to modal container
    if (event.stopPropagation) {
      event.stopPropagation();
    }
  }

  keyup(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.close(true);
    }

    if (event.key === 'Enter') {
      this.clickDefaultAction();
    }
  }

  private clickDefaultAction(): void {
    if (this.defaultActionElement) {
      this.defaultActionElement.nativeElement.click();
    }
  }
}

