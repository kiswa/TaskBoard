import {
    Component,
    Input,
    Output,
    EventEmitter
} from '@angular/core';

@Component({
    selector: 'tb-modal',
    templateUrl: 'app/shared/modal/modal.component.html',
    host: { '(document:keyup)': 'keyup($event)' }
})
export class Modal {
    @Input('modal-title') modalTitle: string;
    @Input() blocking = false;
    @Input('is-open') isOpen = false;
    @Output() onClose = new EventEmitter<boolean>();

    open() {
        this.isOpen = true;
    }

    close(checkBlocking = false) {
        if (checkBlocking && this.blocking) {
            return;
        }

        this.isOpen = false;
        this.onClose.next(false);
    }

    keyup(event: KeyboardEvent) {
        if (event.keyCode === 27) {
            this.close(true);
        }
    }
}

