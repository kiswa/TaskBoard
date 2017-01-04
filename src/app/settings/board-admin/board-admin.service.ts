import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
    ApiResponse,
    Board,
    Column,
    Category,
    IssueTracker,
    User
} from '../../shared/index';
import { BoardData } from './board-data.model';

@Injectable()
export class BoardAdminService {
    constructor(private http: Http) {
    }

    addBoard(board: BoardData): Observable<ApiResponse> {
        return this.http.post('api/boards', board)
            .map(res => {
                let response: ApiResponse = res.json();
                return response;
            })
            .catch((res, caught) => {
               let response: ApiResponse = res.json();
               return Observable.of(response);
            });
    }

    editBoard(board: BoardData): Observable<ApiResponse> {
        return this.http.post('api/boards/' + board.id, board)
            .map(res => {
                let response: ApiResponse = res.json();
                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                return Observable.of(response);
            });
    }

    removeBoard(boardId: number): Observable<ApiResponse> {
        return this.http.delete('api/boards/' + boardId)
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

