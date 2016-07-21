import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { User, ApiResponse } from '../index';
import { Constants } from '../constants';

@Injectable()
export class AuthService {
    activeUser: User = null;

    constructor(constants: Constants, private http: Http,
            private router: Router) {
    }

    authenticate(): Observable<boolean> {
        return this.http.post('api/authenticate', null)
            .map(res => {
                let response: ApiResponse = res.json();
                this.activeUser = response.data[1];

                return this.activeUser !== null;
            })
            .catch((res, caught) => {
                return Observable.of(false);
            });
    }

    login(username: string, password: string,
            remember: boolean): Observable<ApiResponse> {
        let json = JSON.stringify({
            username: username,
            password: password,
            remember: remember
        });

        return this.http.post('api/login', json)
            .map(res => {
                let response: ApiResponse = res.json();
                this.activeUser = response.data[1];

                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                this.activeUser = null;

                return Observable.of(response);
            });
    }

    logout(): Observable<ApiResponse> {
        return this.http.post('api/logout', null)
            .map(res => {
                let response: ApiResponse = res.json();

                return response;
            });
    }
}

