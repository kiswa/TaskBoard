import { Component } from '@angular/core';
import { Router } from '@angular/router';

import {
    Constants,
    AuthService,
    ApiResponse,
    Notification,
    NotificationsService
} from '../shared/index';

@Component({
    selector: 'tb-login',
    templateUrl: 'app/login/login.component.html'
})
export class Login {
    version: string;
    username: string = '';
    password: string = '';
    remember: boolean;
    isSubmitted: boolean = false;

    constructor(constants: Constants, private authService: AuthService,
            private router: Router, private notes: NotificationsService) {
        this.version = constants.VERSION;
    }

    login(): void {
        if (this.username === '' || this.password === '') {
            this.notes.add(new Notification('error',
                'Username and password are required.'));
            return;
        }

        this.isSubmitted = true;

        this.authService.login(this.username, this.password, this.remember)
            .subscribe((response: ApiResponse) => {
                response.alerts.forEach(msg => {
                    this.notes.add(new Notification(msg.type, msg.text));
                });

                if (response.status === 'success') {
                    this.router.navigate(['/boards']);
                }

                this.isSubmitted = false;
        });
    }
}

