import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  ApiResponse,
  Notification
} from '../shared/models';
import {
  AuthService,
  Constants,
  NotificationsService
} from '../shared/services';

@Component({
  selector: 'tb-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  version: string;
  username = '';
  password = '';
  remember = false;
  isSubmitted = false;

  constructor(public constants: Constants, public authService: AuthService,
              private router: Router, private notes: NotificationsService) {
    this.version = constants.VERSION;
  }

  ngOnInit(): void {
    this.authService.authenticate(undefined, true)
      .subscribe(isAuth => {
        if (isAuth) {
          this.router.navigate(['/boards']);
        }
      });
  }

  login(): void {
    if (this.username === '' || this.password === '') {
      this.notes
        .add(new Notification('error',
          'Username and password are required.'));
      return;
    }

    this.isSubmitted = true;

    this.authService.login(this.username, this.password, this.remember)
    .subscribe((response: ApiResponse) => {
      response.alerts.forEach(msg => {
        this.notes.add(new Notification(msg.type, msg.text));
      });

      if (response.status === 'success') {
        if (this.authService.attemptedRoute?.length) {
          this.router.navigate([this.authService.attemptedRoute]);

          this.authService.attemptedRoute = undefined;
          this.isSubmitted = false;

          return;
        }

        this.router.navigate(['/boards']);
      }

      this.isSubmitted = false;
    });
  }
}

