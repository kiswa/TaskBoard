import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiResponse } from 'src/app/shared/models';
import { ModalUser } from './user-admin.models';
import { ApiService } from 'src/app/shared/services';

@Injectable()
export class UserAdminService extends ApiService {
  constructor(private http: HttpClient, strat: LocationStrategy) {
    super(strat);
  }

  addUser(user: ModalUser): Observable<ApiResponse> {
    return this.http.post(this.apiBase + 'users', user)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

  editUser(user: ModalUser): Observable<ApiResponse> {
    return this.http.post(this.apiBase + 'users/' + user.id, user)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

  removeUser(userId: number): Observable<ApiResponse> {
    return this.http.delete(this.apiBase + 'users/' + userId)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }
}

