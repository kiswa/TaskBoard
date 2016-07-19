import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { User, ApiResponse } from '../index';
import { Constants } from '../constants';

@Injectable()
export class AuthService {
    activeUser: User = null;
    jwtKey: string;

    constructor(constants: Constants, private http: Http,
            private router: Router) {
        this.jwtKey = constants.TOKEN;
    }

    authenticate(): Observable<boolean> {
        let headers = this.getHeaders();

        return this.http.post('api/authenticate', null, { headers: headers })
            .map(res => {
                this.checkStatus(res);

                return this.activeUser !== null;
            })
            .catch((res, caught) => {
                this.checkStatus(res);

                return Observable.of(false);
            });
    }

    login(username: string, password: string,
            remember: boolean): Observable<ApiResponse> {
        // TODO Add remember flag to API
        let json = JSON.stringify({
            username: username,
            password: password
        });

        return this.http.post('api/login', json)
            .map(res => {
                let response: ApiResponse = res.json();
                this.checkStatus(res);

                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                this.checkStatus(res);

                return Observable.of(response);
            });
    }

    logout(): Observable<ApiResponse> {
        let headers = this.getHeaders();

        this.clearData();

        return this.http.post('api/logout', null, { headers: headers })
            .map(res => {
                let response: ApiResponse = res.json();
                return response;
            });
    }

    private clearData(): void {
        this.activeUser = null;
        localStorage.removeItem(this.jwtKey);

        this.router.navigate(['']);
    }

    private checkStatus(response: Response): void {
        if (response.status === 200) {
            let apiResponse: ApiResponse = response.json();

            this.activeUser = apiResponse.data[1];
            localStorage.setItem(this.jwtKey, apiResponse.data[0])
        }

        if (response.status === 401) {
            this.clearData();
        }
    }

    private getHeaders(): Headers {
        let token = localStorage.getItem(this.jwtKey);
        let headers = new Headers();

        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', token);

        return headers;
    }
}

