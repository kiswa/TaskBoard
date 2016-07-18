import { Component } from '@angular/core';

import { TopNav } from '../shared/index';
import { UserSettings } from './user-settings/user-settings.component';

@Component({
    selector: 'tb-settings',
    templateUrl: 'app/settings/settings.component.html',
    directives: [ TopNav, UserSettings ]
})
export class Settings {
}

