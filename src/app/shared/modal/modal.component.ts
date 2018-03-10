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
    host: {
        '(document:keyup.enter)': 'keyup($event)',
        '(document:keyup.escape)': 'keyup($event)'
    }
})
export class Modal implements OnInit {
    @Input('modal-id') modalId = '';
    @Input('modal-title') modalTitle = '';
    @Input() blocking = false;
    @Input() wide = false;

    @ContentChild('focusMe') focusElement: any;
    @ContentChild('defaultAction') defaultActionElement: any;

    isOpen = false;
    animate = true;

    constructor(private modalService: ModalService) {
    }

    ngOnInit() {
        this.modalService.registerModal(this);
    }

    close(checkBlocking = false): void {
        this.modalService.close(this.modalId, checkBlocking);
    }

    filterClick(event: Event): void {
        event = event || window.event;

        // Prevent click from propagating to modal container
        if (event.stopPropagation) {
            event.stopPropagation();
        }
    }

    private keyup(event: KeyboardEvent): void {
        if (event.keyCode === 27) {
            this.modalService.close(this.modalId, true);
        }

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

