import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiResponse } from '../../shared/models';
import { ModalUser } from './user-admin.models';

@Injectable()
export class UserAdminService {
  constructor(private http: HttpClient) {
  }

  addUser(user: ModalUser): Observable<ApiResponse> {
    return this.http.post('api/users', user)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  editUser(user: ModalUser): Observable<ApiResponse> {
    return this.http.post('api/users/' + user.id, user)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  removeUser(userId: number): Observable<ApiResponse> {
    return this.http.delete('api/users/' + userId)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }
}

