import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
    selector: 'app-component',
    directives: [ ROUTER_DIRECTIVES ],
    templateUrl: 'app/app.component.html'
})
export class AppComponent {
}

