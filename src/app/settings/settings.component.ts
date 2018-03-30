import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { StringsService } from '../shared/services';

@Component({
  selector: 'tb-settings',
  templateUrl: './settings.component.html'
})
export class Settings {
  public strings: any;

  constructor(private stringsService: StringsService,
              private title: Title) {
    stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;
      title.setTitle('TaskBoard - ' + this.strings['settings']); // tslint:disable-line
    });
  }
}

