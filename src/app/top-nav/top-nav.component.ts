import { Component } from '@angular/core';

@Component({
    selector: 'tb-top-nav',
    templateUrl: 'app/top-nav/top-nav.template.html'
})
export class TopNav {
    pageName: string;
    version: string;

    constructor() {
        this.pageName = 'Dashboard';
        this.version = 'v1.0.0';
    }
}

