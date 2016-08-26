import {
    Component,
    Input,
    OnInit
} from '@angular/core';

import { ModalService } from './modal.service';

@Component({
    selector: 'tb-modal',
    templateUrl: 'app/shared/modal/modal.component.html',
    host: { '(document:keyup)': 'keyup($event)' }
})
export class Modal implements OnInit {
    @Input('modal-id') modalId = '';
    @Input('modal-title') modalTitle = '';
    @Input() blocking = false;
    @Input() wide = false;

    isOpen = false;
    animate = true;

    constructor(private modalService: ModalService) {
    }

    ngOnInit() {
        this.modalService.registerModal(this);
    }

    private close(checkBlocking = false): void {
        this.modalService.close(this.modalId, checkBlocking);
    }

    private keyup(event: KeyboardEvent): void {
        if (event.keyCode === 27) {
            this.modalService.close(this.modalId, true);
        }
    }
}

