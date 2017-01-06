import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Constants } from '../constants';
import { AuthService } from '../auth/index';
import { NotificationsService } from '../notifications/index';
import { Notification } from '../models/index';

@Component({
    selector: 'tb-top-nav',
    templateUrl: 'app/shared/top-nav/top-nav.component.html'
})
export class TopNav {
    @Input('page-name') pageName: string = '';
    version: string = '';
    username: string = '';

    constructor(constants: Constants, private router: Router,
                private authService: AuthService,
                private notes: NotificationsService) {
        this.version = constants.VERSION;

        authService.userChanged
            .subscribe(user => this.username = user.username);
    }

    logout(): void {
        this.authService.logout().subscribe(res => {
            let alert = res.alerts[0];
            this.notes.add(new Notification(alert.type, alert.text));

            this.router.navigate(['']);
        });
    }

    isActive(route: string): boolean {
        return this.router.url.indexOf(route) !== -1;
    }

    navigateTo(target: string): void {
        this.router.navigate(['/' + target]);
    }
}

