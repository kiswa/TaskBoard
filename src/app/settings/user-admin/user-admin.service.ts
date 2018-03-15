import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiResponse } from '../../shared/models';
import { ModalUser } from './user-admin.models';

@Injectable()
export class UserAdminService {
  constructor(private http: Http) {
  }

  addUser(user: ModalUser): Observable<ApiResponse> {
    return this.http.post('api/users', user)
    .map(res => {
      let response: ApiResponse = res.json();
      return response;
    })
    .catch((res, caught) => {
      let response: ApiResponse = res.json();
      return Observable.of(response);
    });
  }

  editUser(user: ModalUser): Observable<ApiResponse> {
    return this.http.post('api/users/' + user.id, user)
    .map(res => {
      let response: ApiResponse = res.json();
      return response;
    })
    .catch((res, caught) => {
      let response: ApiResponse = res.json();
      return Observable.of(response);
    });
  }

  removeUser(userId: number): Observable<ApiResponse> {
    return this.http.delete('api/users/' + userId)
    .map(res => {
      let response: ApiResponse = res.json();
      return response;
    })
    .catch((res, caught) => {
      let response: ApiResponse = res.json();
      return Observable.of(response);
    });
  }
}

