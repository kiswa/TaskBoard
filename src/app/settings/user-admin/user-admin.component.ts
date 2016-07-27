import { Component } from '@angular/core';

import { UserAdminService } from './user-admin.service';
import {
    AuthService,
    User,
    ApiResponse,
    Modal
} from '../../shared/index';

interface UserDisplay extends User {
    default_board_name: string;
    security_level_name: string;
    can_admin: boolean;
}

class NewUser extends User {
    public password: string = '';
    public verifyPassword: string = '';
}

@Component({
    selector: 'tb-user-admin',
    templateUrl: 'app/settings/user-admin/user-admin.component.html',
    providers: [ UserAdminService ],
    directives: [ Modal ]
})
export class UserAdmin {
    private activeUser: User = null;
    private users: Array<UserDisplay>;
    private loading: boolean = true;
    private isModalOpen: boolean = false;
    private newUser: NewUser;

    constructor(private userService: UserAdminService,
            private auth: AuthService) {
        this.newUser = new NewUser();

        auth.userChanged.subscribe(user => this.activeUser = user);

        this.userService.getUsers()
            .subscribe((response: ApiResponse) => {
                this.users = response.data[1];
                this.updateUserList();
                this.loading = false;
            });
    }

    addUser(): void {
        this.newUser = new NewUser();
        this.isModalOpen = true;
    }

    editUser(user: UserDisplay): void {
    }

    removeUser(user: UserDisplay): void {
    }

    private modalClosed(): void {
        this.isModalOpen = false;
    }

    private updateUserList(): void {
        for (var user of this.users) {
            if (user.default_board_id === 0) {
                user.default_board_name = 'None';
            }

            user.security_level_name = user.security_level === 1 ?
                'Admin' :
                user.security_level === 2 ?
                    'Board Admin' :
                    'User';
            // TODO: Determine ability to edit a given user
            user.can_admin = true;
        }
    }
}

