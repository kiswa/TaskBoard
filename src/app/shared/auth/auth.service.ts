import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { User, ApiResponse } from '../index';

@Injectable()
export class AuthService {
    activeUser: User;
    isLoggedIn: boolean = false;

    constructor(private http: Http) {
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

                if (res.status === 200) {
                    this.isLoggedIn = true;
                    this.activeUser = response.data[1];

                    localStorage.setItem('jwt', response.data[0])
                }

                return response;
            }).
            catch((res, caught) => {
                let response: ApiResponse = res.json();

                if (res.status === 401) {
                    this.activeUser = null;
                    this.isLoggedIn = false;

                    localStorage.removeItem('jwt');
                }

                return Observable.of(response);
            });
    }

    logout(): void {
        this.isLoggedIn = false;
    }
}

