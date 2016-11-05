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

    editBoard(board: BoardData): Observable<ApiResponse> {
        let updateBoard = this.convertForApi(board);

        return this.http.post('api/boards/' + updateBoard.id, updateBoard)
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

    private convertForApi(board: BoardData): Board {
        let newBoard = new Board();

        newBoard.id = board.id;
        newBoard.name = board.boardName;

        board.columns.forEach((column, index) => {
            if (column.id) {
                let existing = new Column(column.id, column.name, index,
                                          board.id, column.tasks);
                newBoard.columns.push(existing);
            } else {
                newBoard.addColumn(column.name);
            }
        });

        board.categories.forEach(category => {
            if (category.id) {
                let existing = new Category(category.id, category.name,
                                            category.default_task_color,
                                            board.id);
                newBoard.categories.push(existing);
            } else {
                newBoard.addCategory(category.name, category.defaultColor);
            }
        });

        board.issueTrackers.forEach(tracker => {
            if (tracker.id) {
                let existing = new IssueTracker(tracker.id, tracker.url,
                                                tracker.regex);
                newBoard.issue_trackers.push(existing);
            } else {
                newBoard.addIssueTracker(tracker.url, tracker.regex);
            }
        });

        board.users.forEach(user => {
            newBoard.users.push(user);
        });

        return newBoard;
    }
}

