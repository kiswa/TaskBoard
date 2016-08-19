import { Component } from '@angular/core';

import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';

import {
    ApiResponse,
    User,
    Board,
    Modal,
    Notification,
    ModalService,
    NotificationsService,
    AuthService
} from '../../shared/index';
import { SettingsService } from '../settings.service';
//import { BoardAdminService } from './board-admin.service';
import { BoardData } from './board-data.model';

@Component({
    selector: 'tb-board-admin',
    templateUrl: 'app/settings/board-admin/board-admin.component.html',
    directives: [ Modal, Dragula ],
//    providers: [ BoardAdminService ],
    viewProviders: [ DragulaService ]
})
export class BoardAdmin {
    private users: Array<User>;
    private boards: Array<Board>;
    private activeUser: User;
    private modalProps: BoardData;
    private noBoardsMessage: string;

    private hasBAUsers = false;
    private loading = true;

    private MODAL_ID: string;

    constructor(private auth: AuthService,
            private modal: ModalService,
            private settings: SettingsService,
            private dragula: DragulaService) {
        this.MODAL_ID = 'board-addedit-form';
        this.users = [];
        this.boards = [];
        this.modalProps = new BoardData();

        auth.userChanged
            .subscribe(activeUser => {
                this.activeUser = activeUser;

                this.noBoardsMessage = 'You are not assigned to any boards. ' +
                    'Contact an admin user to be added to a board.';

                if (activeUser.security_level === 1) {
                    this.noBoardsMessage = 'There are no current boards. ' +
                        'Use the <strong>Add Board</strong> button below to add one.';
                }
            });

        settings.usersChanged.subscribe(users => {
            this.users = [];
            this.hasBAUsers = false;

            users.forEach((user) => {
                // Don't include admin users
                if (user.security_level > 1) {
                    this.users.push(user);
                    if (user.security_level === 2) {
                        this.hasBAUsers = true;
                    }
                }
            });
        });

        settings.boardsChanged.subscribe(boards => {
            this.boards = boards;
            this.loading = false;
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

