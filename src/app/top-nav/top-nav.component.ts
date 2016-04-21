import { Component } from 'angular2/core';

@Component({
    selector: 'top-nav',
    templateUrl: 'app/top-nav/top-nav.template.html'
})
export class TopNav {
    pageName: string;
    version: string;

    constructor() {
        this.pageName = 'Testing';
        this.version = 'v1.0.0';
    }
}

