import {
  Component,
  Input,
  OnInit,
  ContentChild
} from '@angular/core';

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

  constructor(public modalService: ModalService) {
  }

  ngOnInit() {
    this.modalService.registerModal(this);
  }

  close(checkBlocking = false): void {
    this.modalService.close(this.modalId, checkBlocking);
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
    // tslint:disable-next-line
    if (event.keyCode === 27) {
      this.modalService.close(this.modalId, true);
    }

    // tslint:disable-next-line
    if (event.keyCode === 13) {
      this.clickDefaultAction();
    }
  }

  private clickDefaultAction(): void {
    if (this.defaultActionElement) {
      this.defaultActionElement.nativeElement.click();
    }
  }
}

