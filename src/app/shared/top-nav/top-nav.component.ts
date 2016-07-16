import { Component, Input } from '@angular/core';
import { ROUTER_DIRECTIVES, Router } from '@angular/router';

import { Constants } from '../../app.constants';
import { AuthService } from '../auth/index';

@Component({
    selector: 'tb-top-nav',
    templateUrl: 'app/shared/top-nav/top-nav.component.html',
    directives: [ ROUTER_DIRECTIVES ]
})
export class TopNav {
    @Input('page-name') pageName: string;
    version: string;

    constructor(constants: Constants, private router: Router,
            private authService: AuthService) {
        this.version = constants.VERSION;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['']);
    }

    isActive(route: string): boolean {
        return this.router.url.indexOf(route) !== -1;
    }

    navigateTo(target: string): void {
        this.router.navigate(['/' + target]);
    }
}

