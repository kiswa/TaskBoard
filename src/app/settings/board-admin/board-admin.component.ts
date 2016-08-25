import { Component } from '@angular/core';

import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';

import {
    ApiResponse,
    Board,
    User,
    InlineEdit,
    Modal,
    Notification,
    AuthService,
    ModalService,
    NotificationsService
} from '../../shared/index';
import { SettingsService } from '../settings.service';
import { BoardAdminService } from './board-admin.service';
import { BoardData } from './board-data.model';

class SelectableUser extends User {
    public selected: boolean;
}

@Component({
    selector: 'tb-board-admin',
    templateUrl: 'app/settings/board-admin/board-admin.component.html',
    directives: [ InlineEdit, Modal, Dragula ],
    providers: [ BoardAdminService ],
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
            private boardService: BoardAdminService,
            private notes: NotificationsService,
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

            users.forEach(user => {
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

    addBoard(): void {
        this.setBoardUsers();

        if (this.validateBoard()) {
            this.boardService.addBoard(this.modalProps)
                .subscribe((response: ApiResponse) => {
                    response.alerts.forEach(note => this.notes.add(note));

                    console.log(response);
                    // TODO: Update boards list

                    if (response.status === 'success') {
                        this.modal.close(this.MODAL_ID);
                    }
                });
        }
    }

    private validateBoard(): boolean {
        if (this.modalProps.boardName === '') {
            this.notes.add(new Notification('error',
                'Board name is required.'));
            return false;
        }

        if (this.modalProps.columns.length === 0) {
            this.notes.add(new Notification('error',
                'At least one column is required.'));
            return false;
        }

        return true;
    }

    private setBoardUsers(): void {
        this.users.forEach((user: SelectableUser) => {
            if (user.selected) {
                this.modalProps.users.push(user);
            }
        });
    }

    private getColumnName(i: number): string {
        return this.modalProps.columns[i].name;
    }

    private onColumnNameEdit(e: string, i: number): void {
        this.modalProps.columns[i].name = e;
    }

    private getCategoryName(i: number): string {
        return this.modalProps.categories[i].name;
    }

    private onCategoryNameEdit(e: string, i: number): void {
        this.modalProps.categories[i].name = e;
    }

    private getTrackerUrl(i): string {
        return this.modalProps.issueTrackers[i].url;
    }

    private onTrackerUrlEdit(e: string, i: number): void {
        this.modalProps.issueTrackers[i].url = e;
    }

    private getTrackerRegExp(i: number): string {
        return this.modalProps.issueTrackers[i].bugId;
    }

    private onTrackerRegExpEdit(e: string, i: number): void {
        this.modalProps.issueTrackers[i].bugId = e;
    }

    private getColor(category: any): string {
        if (category.default_task_color) {
            return category.default_task_color;
        }

        return category.defaultColor;
    }

    private showModal(title: string): void {
        let isAdd = (title === 'Add');

        this.modalProps = new BoardData(title);

        if (isAdd) {
            this.users.forEach((user: SelectableUser) => {
                user.selected = false;
            });
        } else {
            // TODO: Load board data in constructor
        }

        this.modal.open(this.MODAL_ID);
    }
}

