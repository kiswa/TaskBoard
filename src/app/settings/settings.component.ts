import { Component } from '@angular/core';

import { TopNav } from '../shared/index';

@Component({
    selector: 'tb-settings',
    templateUrl: 'app/settings/settings.component.html',
    directives: [ TopNav ]
})
export class Settings {
}

