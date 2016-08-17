import { Component } from '@angular/core';

import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';

import {
    ApiResponse,
    User,
    Modal,
    Notification,
    ModalService,
    NotificationsService,
    AuthService
} from '../../shared/index';
import { BoardData } from './board-data.model';

@Component({
    selector: 'tb-board-admin',
    templateUrl: 'app/settings/board-settings/board-settings.component.html',
    directives: [ Modal, Dragula ],
    viewProviders: [ DragulaService ]
})
export class BoardAdmin {
    private activeUser: User;
    private loading = true;
    private modalProps: BoardData;

    private MODAL_ID: string;

    constructor(private auth: AuthService, private modal: ModalService,
            private dragula: DragulaService) {
        this.MODAL_ID = 'board-addedit-form';

        this.modalProps = new BoardData();

        auth.userChanged
            .subscribe(activeUser => {
                this.activeUser = activeUser;
            });
    }

    ngAfterContentInit() {
        let ul = document.getElementsByClassName('modal-list')[0];

        this.dragula.setOptions('columns-bag', {
            moves: (el, container, handle) => {
                return handle.classList.contains('icon-resize-vertical');
            },
            mirrorContainer: ul
        });
    }

    private getColor(category: any): string {
        return category.defaultColor;
    }

    private showModal(title: string): void {
        let isAdd = (title === 'Add');

        if (isAdd) {
            this.modalProps = new BoardData(title);
        } else {
            // TODO: Load board data in constructor
            this.modalProps = new BoardData(title);
        }

        this.modal.open(this.MODAL_ID);
    }
}

