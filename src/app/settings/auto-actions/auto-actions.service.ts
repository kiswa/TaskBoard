import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
    ApiResponse,
    AutoAction
} from '../../shared/index';

@Injectable()
export class AutoActionsService {
    constructor(private http: Http) {
    }

    addAction(action: AutoAction): Observable<ApiResponse> {
        return this.http.post('api/autoactions', action)
            .map(this.toApiResponse)
            .catch(this.errorHandler);
    }

    removeAction(action: AutoAction): Observable<ApiResponse> {
        return this.http.delete('api/autoactions/' + action.id)
            .map(this.toApiResponse)
            .catch(this.errorHandler);
    }

    private toApiResponse(res: any): ApiResponse {
        let response: ApiResponse = res.json();
        return response;
    }

    private errorHandler(res: any, caught: any): Observable<ApiResponse> {
        let response: ApiResponse = res.json();
        return Observable.of(response);
    }

}

