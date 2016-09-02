import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TopNav } from '../shared/index';
import { SettingsService } from './settings.service';
import {
    UserSettings,
    UserAdmin,
    BoardAdmin
} from './index';

@Component({
    selector: 'tb-settings',
    templateUrl: 'app/settings/settings.component.html',
    providers: [ SettingsService ]
})
export class Settings {
    constructor(private settings: SettingsService, private title: Title) {
        title.setTitle('TaskBoard - Settings');
    }
}

