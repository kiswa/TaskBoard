import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
    ApiResponse,
    User,
    Board
} from '../shared/index';

@Injectable()
export class BoardService {
    constructor(private http: Http) {
    }

    getBoards(): Observable<ApiResponse> {
        return this.http.get('api/boards')
            .map(res => {
                let response: ApiResponse = res.json();
                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                return Observable.of(response);
            });
    }

    refreshToken(): void {
        this.http.post('api/refresh', {}).subscribe();
    }
}

