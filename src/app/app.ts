import { Component } from 'angular2/core';
import { ROUTER_DIRECTIVES, RouteConfig } from 'angular2/router';

import 'rxjs/Rx'; // Import all of RxJs

@Component({
    selector: 'app-component',
    directives: [ ROUTER_DIRECTIVES ],
    templateUrl: 'app/app.template.html'
})
export class AppComponent {
}
