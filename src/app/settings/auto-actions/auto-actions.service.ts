import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

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
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  removeAction(action: AutoAction): Observable<ApiResponse> {
    return this.http.delete('api/autoactions/' + action.id)
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }
}

