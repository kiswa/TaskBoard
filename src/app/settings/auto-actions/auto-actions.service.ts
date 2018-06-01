import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  ApiResponse,
  AutoAction
} from '../../shared/models';

@Injectable()
export class AutoActionsService {
  constructor(private http: HttpClient) {
  }

  addAction(action: AutoAction): Observable<ApiResponse> {
    return this.http.post('api/autoactions', action)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  removeAction(action: AutoAction): Observable<ApiResponse> {
    return this.http.delete('api/autoactions/' + action.id)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }
}

