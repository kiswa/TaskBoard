import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
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
    let json = JSON.stringify(user);

    return this.http.post('api/users/' + this.activeUser.id, json)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
    );
  }

  changePassword(oldPass: string, newPass: string): Observable<ApiResponse> {
    let updateUser: UpdateUser = this.activeUser;
    updateUser.new_password = newPass;
    updateUser.old_password = oldPass;

    let json = JSON.stringify(updateUser);

    return this.http.post('api/users/' + this.activeUser.id, json)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
    );
  }

  changeUsername(newName: string): Observable<ApiResponse> {
    let updateUser = this.activeUser;
    updateUser.username = newName;

    let json = JSON.stringify(updateUser);

    return this.http.post('api/users/' + this.activeUser.id, json)
    .pipe(
      map((response: ApiResponse) => {
        this.auth.updateUser(JSON.parse(response.data[1]));
        return response;
      }),
      catchError((err, caught) => { return caught; })
    );
  }

  changeEmail(newEmail: string): Observable<ApiResponse> {
    let updateUser = this.activeUser;
    updateUser.email = newEmail;

    let json = JSON.stringify(updateUser);

    return this.http.post('api/users/' + this.activeUser.id, json)
    .pipe(
      map((response: ApiResponse) => {
        this.auth.updateUser(JSON.parse(response.data[1]));
        return response;
      }),
      catchError((err, caught) => { return caught; })
    );
  }

  changeUserOptions(newOptions: UserOptions): Observable<ApiResponse> {
    let json = JSON.stringify(newOptions);

    return this.http.post('api/users/' + this.activeUser.id + '/opts', json)
    .pipe(
      map((response: ApiResponse) => {
        this.auth.updateUser(JSON.parse(response.data[1]));
        return response;
      }),
      catchError((err, caught) => { return caught; })
    );
  }
}

