import { Component } from '@angular/core';

import {
    ApiResponse,
    User,
    Modal,
    Notification,
    ModalService,
    NotificationsService,
    AuthService
} from '../../shared/index';

@Component({
    selector: 'tb-board-settings',
    templateUrl: 'app/settings/board-settings/board-settings.component.html',
    directives: [ Modal ]
})
export class BoardSettings {
    private activeUser: User;
    private loading = true;
    private modalProps;

    private MODAL_ID: string;

    constructor(private auth: AuthService, private modal: ModalService) {
        this.MODAL_ID = 'board-addedit-form';
        this.modalProps = {
            boardName: ''
        };

        auth.userChanged
            .subscribe(activeUser => {
                this.activeUser = activeUser;
            });
    }

    private showModal(title: string): void {
        let isAdd = (title === 'Add');
        this.modalProps = {
            title: title
        };

        this.modal.open(this.MODAL_ID);
    }
}

