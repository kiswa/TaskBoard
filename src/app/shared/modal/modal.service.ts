import { Injectable } from '@angular/core';

import { AuthService, UserOptions } from '../index';
import { Modal } from './modal.component';

@Injectable()
export class ModalService {
    private modals: Array<Modal>;
    private userOptions: UserOptions;

    constructor(private auth: AuthService) {
        this.modals = [];
        this.userOptions = auth.userOptions;
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
            modal.animate = (this.userOptions.show_animations);
            modal.isOpen = true;
            document.querySelector('body').classList.add('no-scroll');

            setTimeout(() => {
                if (modal.focusElement) {
                    modal.focusElement.nativeElement.focus();
                }
            }, 100);
        }
    }

    close(modalId: string, checkBlocking = false): void {
        var modal = this.findModal(modalId);

        if (modal) {
            if (checkBlocking && modal.blocking) {
                return;
            }

            modal.isOpen = false;
            document.querySelector('body').classList.remove('no-scroll');
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

