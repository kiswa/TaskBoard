import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Notification } from '../models';
import { Constants } from '../constants';
import {
  AuthService,
  NotificationsService,
} from '../services';
import { StringsService } from '../strings/strings.service';

@Component({
  selector: 'tb-top-nav',
  templateUrl: './top-nav.component.html'
})
export class TopNavComponent {
  public strings: any;

  // tslint:disable-next-line
  @Input('page-name') pageName: string = '';

  // tslint:disable-next-line
  @Input('show-buttons') showButtons: boolean = true;

  version = '';
  username = '';

  constructor(public constants: Constants, private router: Router,
              public authService: AuthService,
              private notes: NotificationsService,
              public stringsService: StringsService) {
    this.version = constants.VERSION;

    authService.userChanged
      .subscribe(user => this.username = user ? user.username : '');

    stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;
    });
  }

  logout(): void {
    this.authService.logout().subscribe(res => {
      const alert = res.alerts[0];
      this.notes.add(new Notification(alert.type, alert.text));

      this.router.navigate(['']);
    });
  }

  isActive(route: string): boolean {
    return this.router.url.indexOf(route) !== -1;
  }

  navigateTo(target: string): void {
    this.router.navigate(['/' + target]);
  }
}

