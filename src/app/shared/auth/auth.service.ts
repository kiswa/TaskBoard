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
import { LocationStrategy } from '@angular/common';
import { ApiService } from '../api-service.service';

@Injectable()
export class AuthService extends ApiService {
  private activeUser = new BehaviorSubject<User>(null);

  public userOptions: UserOptions = null;
  public userChanged = this.activeUser.asObservable();

  public attemptedRoute: string;

  constructor(public constants: Constants, private http: HttpClient, public router: Router,
              private strings: StringsService, strat: LocationStrategy) {
    super(strat);
  }

  updateUser(user: User, userOpts?: UserOptions): void {
    if (userOpts) {
      this.userOptions = this.convertOpts(userOpts);
      this.strings.loadStrings(this.userOptions.language);
    }

    this.activeUser.next(user);
  }

  authenticate(url: string, isLogin = false): Observable<boolean> {
    if (!isLogin) {
      this.attemptedRoute = url;
    }

    return this.http.post(this.apiBase + 'authenticate', null)
    .pipe(
      map((response: ApiResponse) => {
        this.updateUser(response.data[1], response.data[2]);
        return true;
      }),
      catchError((_, __) => of(false))
    );
  }

  login(username: string, password: string,
        remember: boolean): Observable<ApiResponse> {
    const json = JSON.stringify({ username, password, remember });

    return this.http.post(this.apiBase + 'login', json)
    .pipe(
      map((response: ApiResponse) => {
        this.updateUser(response.data[1], response.data[2]);
        return response;
      }),
      catchError((err, _) => {
        this.updateUser(null, null);
        return of(err.error as ApiResponse);
      })
    );
  }

  logout(): Observable<ApiResponse> {
    return this.http.post(this.apiBase + 'logout', null)
    .pipe(
      map((response: ApiResponse) => {
        return response;
      })
    );
  }

  private convertOpts(opts: any): UserOptions {
    const converted = new UserOptions(+opts.id,
      opts.new_tasks_at_bottom === '1',
      opts.show_animations === '1',
      opts.show_assignee === '1',
      opts.multiple_tasks_per_row === '1',
      opts.language);
    return converted;
  }
}

