import { Component } from '@angular/core';

import { Constants } from '../constants.injectable';

@Component({
    selector: 'tb-top-nav',
    templateUrl: 'app/top-nav/top-nav.template.html'
})
export class TopNav {
    pageName: string;
    version: string;

    constructor(constants: Constants) {
        this.pageName = 'Dashboard';
        this.version = constants.VERSION;
    }
}

