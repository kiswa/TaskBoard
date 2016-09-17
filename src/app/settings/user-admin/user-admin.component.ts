import { Component } from '@angular/core';

import { UserAdminService } from './user-admin.service';
import { SettingsService } from '../settings.service';
import {
    User,
    Board,
    ApiResponse,
    Modal,
    Notification,
    AuthService,
    NotificationsService,
    ModalService
} from '../../shared/index';
import { UserDisplay, ModalUser, ModalProperties } from './user-admin.models';

@Component({
    selector: 'tb-user-admin',
    templateUrl: 'app/settings/user-admin/user-admin.component.html',
    providers: [ UserAdminService ]
})
export class UserAdmin {
    private users: Array<UserDisplay>;
    private boards: Array<Board>;
    private activeUser: User;
    private modalProps: ModalProperties;
    private userToRemove: UserDisplay;

    private loading = true;
    private saving = false;

    private MODAL_ID: string;
    private MODAL_CONFIRM_ID: string;

    constructor(private userService: UserAdminService,
            private notes: NotificationsService,
            private auth: AuthService,
            private settings: SettingsService,
            private modal: ModalService) {
        this.MODAL_ID = 'user-addEdit-form';
        this.MODAL_CONFIRM_ID = 'user-remove-confirm';

        this.users = [];
        this.boards = [];
        this.modalProps = new ModalProperties('', '', new ModalUser(new User()));

        auth.userChanged
            .subscribe(activeUser => {
                this.activeUser = activeUser;
                this.replaceUser(activeUser);
            });

        settings.boardsChanged
            .subscribe(boards => {
                this.boards = boards;
            });

        settings.getUsers()
            .subscribe((response: ApiResponse) => {
                this.users = response.data[1];
                this.getBoards();
            });
    }

    addEditUser(): void {
        let isAdd = (this.modalProps.title === 'Add');
        this.saving = true;

        if (!this.validateModalUser()) {
            this.saving = false;
            return;
        }

        if (isAdd) {
            this.userService.addUser(this.modalProps.user)
                .subscribe((response: ApiResponse) => {
                    response.alerts.forEach(note => this.notes.add(note));

                    this.replaceUserList(response);
                    this.closeModal(response.status);
                });

            return;
        }

        this.userService.editUser(this.modalProps.user)
            .subscribe((response: ApiResponse) => {
                response.alerts.forEach(note => this.notes.add(note));

                this.replaceUser(JSON.parse(response.data[1]));
                this.closeModal(response.status);
            });
    }

    removeUser(): void {
        this.userService.removeUser(this.userToRemove.id)
            .subscribe((response: ApiResponse) => {
                response.alerts.forEach(note => this.notes.add(note));
                this.replaceUserList(response);

                if (response.status === 'success') {
                    this.modal.close(this.MODAL_CONFIRM_ID);
                    this.getBoards();
                }
            })
    }

    private closeModal(status: string): void {
        if (status === 'success') {
            this.modal.close(this.MODAL_ID);
            this.saving = false;

            this.getBoards();
        }
    }

    private getBoards(): void {
        this.settings.getBoards()
            .subscribe((response: ApiResponse) => {
                let boards = response.data[1];
                if (boards) {
                    this.boards = boards;
                }

                this.settings.updateBoards(this.boards);
                this.updateUserList();
                this.loading = false;
            });
    }

    private replaceUser(newUser: User) {
        this.users.forEach((user, index) => {
            if (user.id === newUser.id) {
                this.users[index] = <UserDisplay> newUser;
                this.updateUserList();
            }
        });
    }

    private replaceUserList(response: ApiResponse): void {
        if (response.status === 'success') {
            this.users = response.data[1];
            this.updateUserList();
        }
    }

    private validateModalUser(): boolean {
        let user = this.modalProps.user;

        if (user.username === '') {
            this.notes.add(new Notification('error', 'Username is required.'));
            return false;
        }

        if (user.password === '') {
            this.notes.add(new Notification('error', 'Password is required.'));
            return false;
        }

        if (user.password !== user.verifyPassword) {
            this.notes.add(new Notification('error',
                'New password and verify password do not match.'));
            return false;
        }

        let emailRegex = /.+@.+\..+/i;
        let match = user.email.match(emailRegex);

        if (!match && user.email !== '') {
            this.notes.add(new Notification('error', 'Invalid email address.'));
            return false;
        }

        return true;
    }

    private showModal(title: string, user?: UserDisplay): void {
        let isAdd = (title === 'Add');

        this.modalProps = {
            title: title,
            prefix: isAdd ? '' : 'Change',
            user: isAdd ? new ModalUser(new User()) : new ModalUser(user)
        }

        this.modal.open(this.MODAL_ID);
    }

    private showConfirmModal(user: UserDisplay): void {
        this.userToRemove = user;
        this.modal.open(this.MODAL_CONFIRM_ID);
    }

    private getDefaultBoardName(user: UserDisplay): string {
        let filtered = this.boards
            .filter(board => board.id === user.default_board_id);

        if (filtered.length) {
            return filtered[0].name;
        }

        return 'None';
    }

    private updateUserList(): void {
        for (var user of this.users) {
            user = <UserDisplay> user;

            user.default_board_name = this.getDefaultBoardName(user);

            user.security_level_name = user.security_level === 1 ?
                'Admin' :
                user.security_level === 2 ?
                    'Board Admin' :
                    'User';

            user.can_admin = true;

            // TODO: Determine ability to edit a given user
            // This may actually be it, as the API only returns users
            // by board access.
            if (user.id === this.activeUser.id ||
                    this.activeUser.security_level === 3) {
                user.can_admin = false;
            }
        }

        this.settings.updateUsers(<Array<User>> this.users);
    }
}

