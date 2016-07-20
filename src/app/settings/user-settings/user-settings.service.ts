import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import {
    User,
    ApiResponse,
    Constants,
    AuthService
} from '../../shared/index';

interface UpdateUser extends User {
    new_password?: string;
    old_password?: string;
}

@Injectable()
export class UserSettingsService {
    activeUser: User = null;
    jwtKey: string;

    constructor(auth: AuthService, constants: Constants, private http: Http) {
        this.activeUser = auth.activeUser;
        this.jwtKey = constants.TOKEN;
    }

    changePassword(oldPass: string, newPass: string): Observable<ApiResponse> {
        let updateUser: UpdateUser = this.activeUser;
        updateUser.new_password = newPass;
        updateUser.old_password = oldPass;

        let json = JSON.stringify(updateUser);
        let headers = this.getHeaders();

        return this.http.post('api/users/' + this.activeUser.id, json,
                { headers: headers })
            .map(res => {
                let response: ApiResponse = res.json();

                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();

                return Observable.of(response);
            });
    }

    private getHeaders(): Headers {
        let token = localStorage.getItem(this.jwtKey);
        let headers = new Headers();

        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', token);

        return headers;
    }
}

