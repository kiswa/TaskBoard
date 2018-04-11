import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

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
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  changePassword(oldPass: string, newPass: string): Observable<ApiResponse> {
    let updateUser: UpdateUser = this.activeUser;
    updateUser.new_password = newPass;
    updateUser.old_password = oldPass;

    let json = JSON.stringify(updateUser);

    return this.http.post('api/users/' + this.activeUser.id, json)
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  changeUsername(newName: string): Observable<ApiResponse> {
    let updateUser = this.activeUser;
    updateUser.username = newName;

    let json = JSON.stringify(updateUser);

    return this.http.post('api/users/' + this.activeUser.id, json)
    .map((response: ApiResponse) => {
      this.auth.updateUser(JSON.parse(response.data[1]));

      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  changeEmail(newEmail: string): Observable<ApiResponse> {
    let updateUser = this.activeUser;
    updateUser.email = newEmail;

    let json = JSON.stringify(updateUser);

    return this.http.post('api/users/' + this.activeUser.id, json)
    .map((response: ApiResponse) => {
      this.auth.updateUser(JSON.parse(response.data[1]));

      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  changeUserOptions(newOptions: UserOptions): Observable<ApiResponse> {
    let json = JSON.stringify(newOptions);

    return this.http.post('api/users/' + this.activeUser.id + '/opts', json)
    .map((response: ApiResponse) => {
      this.auth.updateUser(JSON.parse(response.data[2]),
        JSON.parse(response.data[1]));

      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }
}

