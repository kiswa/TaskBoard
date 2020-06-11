import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiResponse } from '../shared/models';
import { ApiService } from '../shared/services';

@Injectable()
export class DashboardService extends ApiService {

  constructor(private http: HttpClient, strat: LocationStrategy) {
    super(strat);
  }

  getBoardInfo(): Observable<ApiResponse> {
    return this.http.get(this.apiBase + 'dashboard/boards')
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  getTaskInfo(): Observable<ApiResponse> {
    return this.http.get(this.apiBase + 'dashboard/tasks')
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }
}
