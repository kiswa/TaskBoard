import { Component } from "@angular/core";

import { Constants } from '../constants.injectable';

@Component({
    selector: 'tb-login',
    templateUrl: 'app/login/login.template.html'
})
export class Login {
    version: string;

    constructor(constants: Constants) {
        this.version = constants.VERSION;
    }
}

