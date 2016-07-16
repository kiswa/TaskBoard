import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { Notifications } from './shared/index';

@Component({
    selector: 'app-component',
    directives: [ ROUTER_DIRECTIVES, Notifications ],
    templateUrl: 'app/app.component.html'
})
export class AppComponent {
}

