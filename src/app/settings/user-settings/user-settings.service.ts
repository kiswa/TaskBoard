import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

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

    constructor(auth: AuthService, constants: Constants, private http: Http) {
        this.activeUser = auth.activeUser;
    }

    changePassword(oldPass: string, newPass: string): Observable<ApiResponse> {
        let updateUser: UpdateUser = this.activeUser;
        updateUser.new_password = newPass;
        updateUser.old_password = oldPass;

        let json = JSON.stringify(updateUser);

        return this.http.post('api/users/' + this.activeUser.id, json)
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

