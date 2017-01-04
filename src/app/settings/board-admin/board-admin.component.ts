import { Component } from '@angular/core';

import { DragulaService } from 'ng2-dragula/ng2-dragula';

import {
    ApiResponse,
    Board,
    Column,
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
    providers: [ BoardAdminService ],
    viewProviders: [ DragulaService ]
})
export class BoardAdmin {
    private users: Array<User>;
    private boards: Array<Board>;
    private activeUser: User;
    private modalProps: BoardData;
    private noBoardsMessage: string;
    private boardToRemove: Board;

    private hasBAUsers = false;
    private loading = true;
    private saving = false;

    private MODAL_ID: string;
    private MODAL_CONFIRM_ID: string;

    constructor(private auth: AuthService,
            private modal: ModalService,
            private settings: SettingsService,
            private boardService: BoardAdminService,
            private notes: NotificationsService,
            private dragula: DragulaService) {
        this.MODAL_ID = 'board-addedit-form';
        this.MODAL_CONFIRM_ID = 'board-remove-confirm';

        this.users = [];
        this.boards = [];
        this.modalProps = new BoardData();

        auth.userChanged
            .subscribe(activeUser => {
                this.activeUser = new User(+activeUser.default_board_id,
                    activeUser.email, +activeUser.id, activeUser.last_login,
                    +activeUser.security_level, +activeUser.user_option_id,
                    activeUser.username, activeUser.board_access);

                this.noBoardsMessage = 'You are not assigned to any boards. ' +
                    'Contact an admin user to be added to a board.';

                if (+activeUser.security_level === 1) {
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

            this.boards.forEach(board => {
                board.columns.sort((a: Column, b: Column) => {
                    return +a.position < +b.position
                        ? -1
                        : +a.position > b.position
                            ? 1
                            : 0;
                });
            });

            this.loading = false;
        });
    }

    ngAfterContentInit() {
        let ul = document.getElementsByClassName('modal-list')[0];
        let bag = this.dragula.find('columns-bag');

        if (bag !== undefined) {
            this.dragula.destroy('columns-bag');
        }

        this.dragula.setOptions('columns-bag', {
            moves: (el: any, container: any, handle: any) => {
                return handle.classList.contains('icon-resize-vertical');
            },
            mirrorContainer: ul
        });

        this.dragula.dragend.subscribe(() => {
            this.modalProps.columns.forEach((item, index) => {
                item.position = "" + index;
            });
        });
    }

    addEditBoard(): void {
        let isAdd = this.modalProps.title === 'Add';

        this.saving = true;
        this.setBoardUsers();

        if (!this.validateBoard()) {
            this.saving = false;
            return;
        }

        if (isAdd) {
            this.boardService.addBoard(this.modalProps)
                .subscribe(this.handleResponse);
            return;
        }

        this.boardService.editBoard(this.modalProps)
            .subscribe(this.handleResponse);
    }

    removeBoard() {
        this.saving = true;

        this.boardService.removeBoard(this.boardToRemove.id)
            .subscribe(this.handleResponse);
    }

    private validateBoard(): boolean {
        if (this.modalProps.name === '') {
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

    private handleResponse = (response: ApiResponse) => {
        response.alerts.forEach(note => this.notes.add(note));

        if (response.status === 'success') {
            this.modal.close(this.MODAL_ID);
            this.modal.close(this.MODAL_CONFIRM_ID);

            let boards = Array<Board>();
            response.data[1].forEach((board: any) => {
                boards.push(new Board(+board.id, board.name,
                    board.is_active === '1', board.ownColumn,
                    board.ownCategory, board.ownAutoAction,
                    board.ownIssuetracker, board.sharedUser));
            });

            this.settings.updateBoards(boards);
            this.saving = false;
        }
    }

    private setBoardUsers(): void {
        this.modalProps.users = [];

        this.users.forEach((user: SelectableUser) => {
            if (user.selected) {
                this.modalProps.users.push(user);
            }
        });
    }

    private getPropertyValue(obj: string, prop: string, i: number): string {
        return this.modalProps[obj][i][prop];
    }

    private onPropertyEdit(obj: string, prop: string,
            i: number, value: any): void {
        this.modalProps[obj][i][prop] = value;
    }

    private getColor(category: any): string {
        if (category.default_task_color) {
            return category.default_task_color;
        }

        return category.defaultColor;
    }

    private deepCopy(source: any) {
        var output: any, value: any, key: any;

        output = Array.isArray(source) ? [] : {};

        for (key in source) {
            value = source[key];
            output[key] = (typeof value === "object") ?
                this.deepCopy(value) : value;
        }

        return output;
    }

    private showModal(title: string, board?: Board): void {
        let isAdd = (title === 'Add');

        this.modalProps = new BoardData(title);

        if (isAdd) {
            this.users.forEach((user: SelectableUser) => {
                user.selected = false;
            });
        } else {
            this.modalProps.id = board.id;
            this.modalProps.name = board.name;
            this.modalProps.columns = this.deepCopy(board.columns);
            this.modalProps.categories = this.deepCopy(board.categories);
            this.modalProps.issue_trackers = this.deepCopy(board.issue_trackers);

            this.users.forEach((user: SelectableUser) => {
                let filtered = board.users.filter(u => +u.id === user.id);

                user.selected = filtered.length > 0;
            });
        }

        this.modal.open(this.MODAL_ID);
    }

    private showConfirmModal(board: Board): void {
        this.boardToRemove = board;
        this.modal.open(this.MODAL_CONFIRM_ID);
    }
}

