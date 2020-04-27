import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { StringsService, AuthService } from '../shared/services';
import { User } from '../shared/models';

@Component({
  selector: 'tb-file-viewer',
  templateUrl: './file-viewer.component.html'
})
export class FileViewerComponent implements OnInit,  OnDestroy {
  private subs: any[];

  public activeUser: User;
  public pageName: string;
  public strings: any;

  constructor(public title: Title,
              public auth: AuthService,
              public stringsService: StringsService) {
    title.setTitle('TaskBoard - File Viewer');
    this.subs = [];

    let sub = stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;
    });
    this.subs.push(sub);

    sub = auth.userChanged.subscribe((user: User) => {
      this.activeUser = user;
    });
    this.subs.push(sub);

  }

  ngOnInit() {
    this.pageName = this.strings.files;

    console.log(this.stringsService, this.activeUser, this.pageName);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}

