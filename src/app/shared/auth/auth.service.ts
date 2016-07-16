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

    constructor(constants: Constants, private http: Http, private router: Router) {
        this.jwtKey = constants.TOKEN;
    }

    authenticate(): Observable<boolean> {
        let token = localStorage.getItem(this.jwtKey);
        let header = new Headers({'Authorization': token});

        return this.http.post('api/authenticate', token, { headers: header }).
            map(res => {
                let response: ApiResponse = res.json();

                if (res.status === 200 && response.data.length) {
                    this.activeUser = response.data[1];
                }

                return true;
            }).
            catch((res, caught) => {
                let response: ApiResponse = res.json();
                this.activeUser = null;
                localStorage.removeItem(this.jwtKey);

                this.router.navigate(['']);

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

        return this.http.post('api/login', json).
            map(res => {
                let response: ApiResponse = res.json();
                this.checkStatus(res);

                return response;
            }).
            catch((res, caught) => {
                let response: ApiResponse = res.json();
                this.checkStatus(res);

                return Observable.of(response);
            });
    }

    logout(): void {
        this.activeUser = null;
        localStorage.removeItem(this.jwtKey);

        this.router.navigate(['']);
    }

    private checkStatus(response: Response) {
        if (response.status === 200) {
            let apiResponse: ApiResponse = response.json();

            this.activeUser = apiResponse.data[1];
            localStorage.setItem(this.jwtKey, apiResponse.data[0])
        }

        if (response.status === 401) {
            this.logout();
        }
    }
}

