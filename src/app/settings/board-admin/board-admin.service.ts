import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { ApiResponse, Board, User } from '../../shared/index';
import { BoardData } from './board-data.model';

@Injectable()
export class BoardAdminService {
    constructor(private http: Http) {
    }

    addBoard(board: BoardData): Observable<ApiResponse> {
        let newBoard = this.convertForApi(board);

        return this.http.post('api/boards', newBoard)
            .map(res => {
                let response: ApiResponse = res.json();
                return response;
            })
            .catch((res, caught) => {
               let response: ApiResponse = res.json();
               return Observable.of(response);
            });
    }

    private convertForApi(board: BoardData): Board {
        let newBoard = new Board();

        newBoard.name = board.boardName;

        board.columns.forEach(column => {
            newBoard.addColumn(column.name);
        });

        board.categories.forEach(category => {
            newBoard.addCategory(category.name, category.defaultColor);
        });

        board.issueTrackers.forEach(tracker => {
            newBoard.addIssueTracker(tracker.url, tracker.bugId);
        });

        board.users.forEach(user => {
            newBoard.users.push(user);
        });

        return newBoard;
    }
}

