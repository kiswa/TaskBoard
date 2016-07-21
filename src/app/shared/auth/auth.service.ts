import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { User, ApiResponse } from '../index';
import { Constants } from '../constants';

@Injectable()
export class AuthService {
    private activeUser = new BehaviorSubject<User>(null);

    public userChanged = this.activeUser.asObservable();

    constructor(constants: Constants, private http: Http,
            private router: Router) {
    }

    updateUser(user: User): void {
        this.activeUser.next(user);
    }

    authenticate(): Observable<boolean> {
        return this.http.post('api/authenticate', null)
            .map(res => {
                let response: ApiResponse = res.json();
                this.updateUser(response.data[1]);

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
                this.updateUser(response.data[1]);

                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                this.updateUser(null);

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

