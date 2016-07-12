import { Component } from '@angular/core';

import { Constants } from '../app.constants';

@Component({
    selector: 'tb-top-nav',
    templateUrl: 'app/top-nav/top-nav.component.html'
})
export class TopNav {
    pageName: string;
    version: string;

    constructor(constants: Constants) {
        this.pageName = 'TaskBoard Re-Write';
        this.version = constants.VERSION;
    }
}

