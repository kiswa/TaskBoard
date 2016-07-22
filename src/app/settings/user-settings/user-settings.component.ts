import { Component, OnInit } from '@angular/core';

import { UserSettingsService } from './user-settings.service';
import {
    PassForm,
    UsernameForm,
    EmailForm
} from './user-settings.models';
import {
    AuthService,
    NotificationsService,
    User,
    Notification,
    ApiResponse
} from '../../shared/index';

@Component({
    selector: 'tb-user-settings',
    templateUrl: 'app/settings/user-settings/user-settings.component.html',
    providers: [ UserSettingsService ]
})
export class UserSettings implements OnInit {
    private user: User;
    private changePassword: PassForm;
    private changeUsername: UsernameForm;
    private changeEmail: EmailForm

    constructor(private auth: AuthService,
            private notes: NotificationsService,
            private userService: UserSettingsService) {
        auth.userChanged.subscribe(user => this.user = user);
    }

    ngOnInit() {
        this.resetForms();
    }

    updatePassword() {
        this.changePassword.submitted = true;

        if (!this.validatePassForm()) {
            return;
        }

        this.userService
            .changePassword(this.changePassword.current,
                    this.changePassword.newPass)
            .subscribe((response: ApiResponse) => {
                this.addAlerts(response.alerts);
                this.resetPasswordForm();
                this.changePassword.submitted = false;
            });
    }

    updateUsername() {
        this.changeUsername.submitted = true;

        if (this.changeUsername.newName === '') {
            this.notes.add(new Notification('error',
                'New Username cannot be blank.'));
            this.changeUsername.submitted = false;

            return;
        }

        this.userService
            .changeUsername(this.changeUsername.newName)
            .subscribe((response: ApiResponse) => {
                this.addAlerts(response.alerts);
                this.resetUsernameForm();
                this.changeUsername.submitted = false;
            });
    }

    updateEmail() {
        this.changeEmail.submitted = true;

        let emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        let match = this.changeEmail.newEmail.match(emailRegex);

        if (!match && this.changeEmail.newEmail !== '') {
            this.notes.add(new Notification('error',
                'Invalid email address.'));
            this.changeEmail.submitted = false;

            return;
        }

        this.userService
            .changeEmail(this.changeEmail.newEmail)
            .subscribe((response: ApiResponse) => {
                this.addAlerts(response.alerts);
                this.resetEmailForm();
                this.changeEmail.submitted = false;
            });
    }

    resetPasswordForm() {
        this.changePassword = new PassForm();
    }

    resetUsernameForm() {
        this.changeUsername = new UsernameForm();
    }

    resetEmailForm() {
        this.changeEmail = new EmailForm(this.user.email);
    }

    private addAlerts(alerts: Array<Notification>) {
        alerts.forEach(msg => {
            this.notes.add(msg);
        });
    }

    private resetForms() {
        this.resetPasswordForm();
        this.resetUsernameForm();
        this.resetEmailForm();
    }

    private validatePassForm() {
        if (this.changePassword.current === '' ||
                this.changePassword.newPass === '' ||
                this.changePassword.verPass === '') {
            this.notes.add(new Notification('error',
                'All fields are required to change your password.'));
            this.changePassword.submitted = false;

            return false;
        }

        if (this.changePassword.newPass !== this.changePassword.verPass) {
            this.notes.add(new Notification('error',
                'New password and verify password do not match.'));
            this.changePassword.submitted = false;

            return false;
        }

        return true;
    }
}

