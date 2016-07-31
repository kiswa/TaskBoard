import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { ApiResponse } from '../../shared/index';
import { ModalUser } from './user-admin.component';

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

    addUser(user: ModalUser): Observable<ApiResponse> {
        return this.http.post('api/users', user)
            .map(res => {
                let response: ApiResponse = res.json();
                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                return Observable.of(response);
            });
    }

    editUser(user: ModalUser): Observable<ApiResponse> {
        return this.http.post('api/users/' + user.id, user)
            .map(res => {
                let response: ApiResponse = res.json();
                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                return Observable.of(response);
            });
    }

    removeUser(userId: number): Observable<ApiResponse> {
        return this.http.delete('api/users/' + userId)
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

