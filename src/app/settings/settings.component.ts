import { Component, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { StringsService } from '../shared/services';

@Component({
  selector: 'tb-settings',
  templateUrl: './settings.component.html'
})
export class Settings implements OnDestroy {
  public strings: any;
  private subs: Array<any>;

  constructor(private stringsService: StringsService,
              private title: Title) {
    this.subs = [];

    let sub = stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;
      title.setTitle('TaskBoard - ' + this.strings['settings']); // tslint:disable-line
    });
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}

