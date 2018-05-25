import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  ApiResponse,
  User,
  UserOptions
} from '../models';
import { Constants } from '../constants';
import { StringsService } from '../strings/strings.service';

@Injectable()
export class AuthService {
  private activeUser = new BehaviorSubject<User>(null);

  public userOptions: UserOptions = null;
  public userChanged = this.activeUser.asObservable();

  constructor(constants: Constants, private http: HttpClient,
              private router: Router, private strings: StringsService) {
  }

  updateUser(user: User, userOpts?: UserOptions): void {
    if (userOpts) {
      this.userOptions = this.convertOpts(userOpts);
      this.strings.loadStrings(this.userOptions.language);
    }

    this.activeUser.next(user);
  }

  authenticate(): Observable<boolean> {
    return this.http.post('api/authenticate', null)
    .pipe(
      map((response: ApiResponse) => {
        this.updateUser(response.data[1], response.data[2]);
        return true;
      }),
      catchError((err, caught) => { return of(false); })
    );
  }

  login(username: string, password: string,
        remember: boolean): Observable<ApiResponse> {
      let json = JSON.stringify({
        username,
        password,
        remember
      });

      return this.http.post('api/login', json)
      .pipe(
        map((response: ApiResponse) => {
          this.updateUser(response.data[1], response.data[2]);
          return response;
        }),
        catchError((err, caught) => {
          this.updateUser(null, null);
          return caught;
        })
      );
    }

  logout(): Observable<ApiResponse> {
    return this.http.post('api/logout', null)
    .pipe(
      map((response: ApiResponse) => {
        return response;
      })
    );
  }

  private convertOpts(opts: any): UserOptions {
    let converted = new UserOptions(+opts.id,
                                    opts.new_tasks_at_bottom === '1',
                                    opts.show_animations === '1',
                                    opts.show_assignee === '1',
                                    opts.multiple_tasks_per_row === '1',
                                    opts.language);
    return converted;
  }
}

