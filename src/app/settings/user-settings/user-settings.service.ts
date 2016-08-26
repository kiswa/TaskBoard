import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import {
    User,
    UserOptions,
    ApiResponse,
    AuthService
} from '../../shared/index';

interface UpdateUser extends User {
    new_password?: string;
    old_password?: string;
}

@Injectable()
export class UserSettingsService {
    activeUser: User = null;

    constructor(private auth: AuthService, private http: Http) {
        auth.userChanged.subscribe(user => this.activeUser = user);
    }

    changeDefaultBoard(user: User): Observable<ApiResponse> {
        let json = JSON.stringify(user);

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

    changeUsername(newName: string): Observable<ApiResponse> {
        let updateUser = this.activeUser;
        updateUser.username = newName;

        let json = JSON.stringify(updateUser);

        return this.http.post('api/users/' + this.activeUser.id, json)
            .map(res => {
                let response: ApiResponse = res.json();
                this.auth.updateUser(JSON.parse(response.data[1]));

                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                return Observable.of(response);
            });
    }

    changeEmail(newEmail: string): Observable<ApiResponse> {
        let updateUser = this.activeUser;
        updateUser.email = newEmail;

        let json = JSON.stringify(updateUser);

        return this.http.post('api/users/' + this.activeUser.id, json)
            .map(res => {
                let response: ApiResponse = res.json();
                this.auth.updateUser(JSON.parse(response.data[1]));

                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                return Observable.of(response);
            });
    }

    changeUserOptions(newOptions: UserOptions): Observable<ApiResponse> {
        let json = JSON.stringify(newOptions);

        return this.http.post('api/users/' + this.activeUser.id + '/opts', json)
            .map(res => {
                let response: ApiResponse = res.json();

                this.auth.updateUser(JSON.parse(response.data[2]));

                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                return Observable.of(response);
            });
    }
}

