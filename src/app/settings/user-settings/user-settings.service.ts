import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  User,
  UserOptions,
  ApiResponse
} from '../../shared/models';
import { AuthService } from '../../shared/services';

interface UpdateUser extends User {
  new_password?: string;
  old_password?: string;
}

@Injectable()
export class UserSettingsService {
  activeUser: User = null;

  constructor(private auth: AuthService, private http: HttpClient) {
    auth.userChanged.subscribe(user => this.activeUser = user);
  }

  changeDefaultBoard(user: User): Observable<ApiResponse> {
    const json = JSON.stringify(user);

    return this.http.post('api/users/' + this.activeUser.id, json)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

  changePassword(oldPass: string, newPass: string): Observable<ApiResponse> {
    const updateUser: UpdateUser = this.activeUser;
    updateUser.new_password = newPass;
    updateUser.old_password = oldPass;

    const json = JSON.stringify(updateUser);

    return this.http.post('api/users/' + this.activeUser.id, json)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

  changeUsername(newName: string): Observable<ApiResponse> {
    const updateUser = this.activeUser;
    updateUser.username = newName;

    const json = JSON.stringify(updateUser);

    return this.http.post('api/users/' + this.activeUser.id, json)
    .pipe(
      map((response: ApiResponse) => {
        this.auth.updateUser(JSON.parse(response.data[1]));
        return response;
      }),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

  changeEmail(newEmail: string): Observable<ApiResponse> {
    const updateUser = this.activeUser;
    updateUser.email = newEmail;

    const json = JSON.stringify(updateUser);

    return this.http.post('api/users/' + this.activeUser.id, json)
    .pipe(
      map((response: ApiResponse) => {
        this.auth.updateUser(JSON.parse(response.data[1]));
        return response;
      }),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

  changeUserOptions(newOptions: UserOptions): Observable<ApiResponse> {
    const json = JSON.stringify(newOptions);

    return this.http.post('api/users/' + this.activeUser.id + '/opts', json)
    .pipe(
      map((response: ApiResponse) => {
        this.auth.updateUser(JSON.parse(response.data[2]),
                             JSON.parse(response.data[1]));
        return response;
      }),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }
}

