import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { User, ApiResponse } from '../../shared/index';

@Injectable()
export class UserAdminService {
    constructor(private http: Http) {
    }

    getUsers(): Observable<ApiResponse> {
        return this.http.get('api/users')
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

