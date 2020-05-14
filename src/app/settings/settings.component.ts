import { Component, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { StringsService } from '../shared/services';
import { SettingsService } from './settings.service';

@Component({
  selector: 'tb-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnDestroy {
  public strings: any;
  private subs: any[];

  constructor(public stringsService: StringsService,
              public settings: SettingsService,
              public title: Title) {
    this.subs = [];

    const sub = stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;
      title.setTitle('TaskBoard - ' + this.strings['settings']); // tslint:disable-line
    });
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}

