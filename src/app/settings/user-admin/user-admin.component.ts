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

class UserDisplay extends User {
    public default_board_name: string;
    public security_level_name: string;
    public can_admin: boolean;
}

export class ModalUser extends UserDisplay {
    public password: string = '';
    public verifyPassword: string = '';
}

class ModalProperties {
    constructor(public title: string,
        public prefix: string,
        public user: ModalUser) {
    }
}

@Component({
    selector: 'tb-user-admin',
    templateUrl: 'app/settings/user-admin/user-admin.component.html',
    providers: [ UserAdminService ],
    directives: [ Modal ]
})
export class UserAdmin {
    private users: Array<UserDisplay>;
    private boards: Array<Board>;
    private activeUser: User;
    private modalProps: ModalProperties;
    private userToRemove: UserDisplay;

    private loading = true;

    private MODAL_ID: string;
    private MODAL_CONFIRM_ID: string;

    constructor(private userService: UserAdminService,
            private notes: NotificationsService,
            private auth: AuthService,
            private settings: SettingsService,
            private modal: ModalService) {
        this.modalProps = new ModalProperties('', '', new ModalUser());
        this.MODAL_ID = 'user-addEdit-form';
        this.MODAL_CONFIRM_ID = 'user-remove-confirm';
        this.users = [];
        this.boards = [];

        auth.userChanged
            .subscribe(activeUser => {
                this.activeUser = activeUser;
                this.replaceUser(activeUser);
            });

        settings.getUsers()
            .subscribe((response: ApiResponse) => {
                this.users = response.data[1];
                this.updateUserList();
                this.loading = false;

                this.settings.getBoards()
                    .subscribe((response: ApiResponse) => {
                        let boards = response.data[1];
                        if (boards) {
                            this.boards = boards;
                        }

                        this.settings.updateBoards(this.boards);
                    });
            });
    }

    addEditUser(): void {
        let isAdd = (this.modalProps.title === 'Add');

        if (!this.validateModalUser()) {
            return;
        }

        if (isAdd) {
            this.userService.addUser(this.modalProps.user)
                .subscribe((response: ApiResponse) => {
                    response.alerts.forEach(note => this.notes.add(note));

                    this.replaceUserList(response);

                    if (response.status === 'success') {
                        this.modal.close(this.MODAL_ID);
                    }
                });

            return;
        }

        this.userService.editUser(this.modalProps.user)
            .subscribe((response: ApiResponse) => {
                response.alerts.forEach(note => this.notes.add(note));

                this.replaceUser(JSON.parse(response.data[1]));

                if (response.status === 'success') {
                    this.modal.close(this.MODAL_ID);
                }
            });
    }

    removeUser(): void {
        this.userService.removeUser(this.userToRemove.id)
            .subscribe((response: ApiResponse) => {
                response.alerts.forEach(note => this.notes.add(note));
                this.replaceUserList(response);

                if (response.status === 'success') {
                    this.modal.close(this.MODAL_CONFIRM_ID);
                }
            })
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
            user: isAdd ? new ModalUser() : <ModalUser> user
        }

        this.modal.open(this.MODAL_ID);
    }

    private showConfirmModal(user: UserDisplay): void {
        this.userToRemove = user;
        this.modal.open(this.MODAL_CONFIRM_ID);
    }

    private updateUserList(): void {
        for (var user of this.users) {
            user = <UserDisplay> user;

            if (user.default_board_id === 0) {
                user.default_board_name = 'None';
            }

            user.security_level_name = user.security_level === 1 ?
                'Admin' :
                user.security_level === 2 ?
                    'Board Admin' :
                    'User';

            user.can_admin = true;

            // TODO: Determine ability to edit a given user
            if (user.id === this.activeUser.id ||
                    this.activeUser.security_level === 3) {
                user.can_admin = false;
            }
        }

        this.settings.updateUsers(<Array<User>> this.users);
    }
}

