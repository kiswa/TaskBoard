import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { StringsService } from '../shared/index';
import { SettingsService } from './settings.service';

@Component({
    selector: 'tb-settings',
    templateUrl: './settings.component.html',
    providers: [ SettingsService ]
})
export class Settings {
    public strings: any;

    constructor(private settings: SettingsService,
                private stringsService: StringsService,
                private title: Title) {
        // SettingsService is loaded here so the same instance is available
        // to all child components.

        stringsService.stringsChanged.subscribe(newStrings => {
            this.strings = newStrings;
            title.setTitle('TaskBoard - ' + this.strings['settings']); // tslint:disable-line
        });
    }
}

