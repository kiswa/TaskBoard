import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { User, UserOptions, ApiResponse } from '../index';
import { Constants } from '../constants';

@Injectable()
export class AuthService {
    private activeUser = new BehaviorSubject<User>(null);

    public userOptions: UserOptions = null;
    public userChanged = this.activeUser.asObservable();

    constructor(constants: Constants, private http: Http,
                private router: Router) {
    }

    updateUser(user: User, userOpts?: UserOptions): void {
        this.activeUser.next(user);

        if (userOpts) {
            this.userOptions = this.convertOpts(userOpts);
        }
    }

    authenticate(): Observable<boolean> {
        return this.http.post('api/authenticate', null)
            .map(res => {
                let response: ApiResponse = res.json();
                this.updateUser(response.data[1], response.data[2]);

                return true;
            })
            .catch((res, caught) => {
                return Observable.of(false);
            });
    }

    login(username: string, password: string,
          remember: boolean): Observable<ApiResponse> {
        let json = JSON.stringify({
            username,
            password,
            remember
        });

        return this.http.post('api/login', json)
            .map(res => {
                let response: ApiResponse = res.json();
                this.updateUser(response.data[1], response.data[2]);

                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                this.updateUser(null, null);

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

    private convertOpts(opts: any): UserOptions {
        let converted = <UserOptions> {};

        converted.id = +opts.id;
        converted.new_tasks_at_bottom = opts.new_tasks_at_bottom === '1';
        converted.show_animations = opts.show_animations === '1';
        converted.show_assignee = opts.show_assignee === '1';
        converted.multiple_tasks_per_row = opts.multiple_tasks_per_row === '1';

        return converted;
    }
}

