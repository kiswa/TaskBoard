import { Component } from "@angular/core";

import { Constants } from '../app.constants';

@Component({
    selector: 'tb-login',
    templateUrl: 'app/login/login.component.html'
})
export class Login {
    version: string;

    constructor(constants: Constants) {
        this.version = constants.VERSION;
    }
}

