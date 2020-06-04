import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  ApiResponse,
  AutoAction
} from '../../shared/models';
import { ApiService } from 'src/app/shared/services';

@Injectable()
export class AutoActionsService extends ApiService {
  constructor(private http: HttpClient, strat: LocationStrategy) {
    super(strat)
  }

  addAction(action: AutoAction): Observable<ApiResponse> {
    return this.http.post(this.apiBase + 'autoactions', action)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

  removeAction(action: AutoAction): Observable<ApiResponse> {
    return this.http.delete(this.apiBase + 'autoactions/' + action.id)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }
}

