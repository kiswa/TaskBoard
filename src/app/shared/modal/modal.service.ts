import { Injectable } from '@angular/core';

import { Modal } from './modal.component';

@Injectable()
export class ModalService {
    private modals: Array<Modal>;

    constructor() {
        this.modals = [];
    }

    registerModal(newModal: Modal): void {
        var modal = this.findModal(newModal.modalId);

        // Delete existing to replace the modal
        if (modal) {
            this.modals.splice(this.modals.indexOf(modal));
        }

        this.modals.push(newModal);
    }

    open(modalId: string): void {
        var modal = this.findModal(modalId);

        if (modal) {
            modal.isOpen = true;
        }
    }

    close(modalId: string, checkBlocking = false): void {
        var modal = this.findModal(modalId);

        if (modal) {
            if (checkBlocking && modal.blocking) {
                return;
            }

            modal.isOpen = false;
        }
    }

    private findModal(modalId: string): Modal {
        for (var modal of this.modals) {
            if (modal.modalId === modalId) {
                return modal;
            }
        }

        return null;
    }
}

