import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiResponse } from '../../shared/models';
import { ModalUser } from './user-admin.models';

@Injectable()
export class UserAdminService {
  constructor(private http: HttpClient) {
  }

  addUser(user: ModalUser): Observable<ApiResponse> {
    return this.http.post('api/users', user)
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  editUser(user: ModalUser): Observable<ApiResponse> {
    return this.http.post('api/users/' + user.id, user)
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  removeUser(userId: number): Observable<ApiResponse> {
    return this.http.delete('api/users/' + userId)
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }
}

