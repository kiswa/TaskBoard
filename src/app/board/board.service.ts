import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
    ApiResponse,
    Column,
    Board,
    Task,
    User
} from '../shared/index';

@Injectable()
export class BoardService {
    private activeBoard = new BehaviorSubject<Board>(null);

    public activeBoardChanged = this.activeBoard.asObservable();

    constructor(private http: Http) {
    }

    updateActiveBoard(board: Board): void {
        let newBoard = this.convertBoardData(board);
        this.activeBoard.next(newBoard);
    }

    getBoards(): Observable<ApiResponse> {
        return this.http.get('api/boards')
            .map(this.toApiResponse)
            .catch(this.errorHandler);
    }

    toggleCollapsed(userId: number, columnId: number): Observable<ApiResponse> {
        return this.http.post('api/users/' + userId + '/cols',
                              { id: columnId })
            .map(this.toApiResponse)
            .catch(this.errorHandler);
    }

    updateBoard(board: Board): Observable<ApiResponse> {
        return this.http.post('api/boards/' + board.id, board)
            .map(this.toApiResponse)
            .catch(this.errorHandler);
    }

    updateColumn(column: Column): Observable<ApiResponse> {
        return this.http.post('api/columns/' + column.id, column)
            .map(this.toApiResponse)
            .catch(this.errorHandler);
    }

    addTask(task: Task): Observable<ApiResponse> {
        return this.http.post('api/tasks', task)
            .map(this.toApiResponse)
            .catch(this.errorHandler);
    }

    updateTask(task: Task): Observable<ApiResponse> {
        return this.http.post('api/tasks/' + task.id, task)
            .map(this.toApiResponse)
            .catch(this.errorHandler);
    }

    removeTask(taskId: number): Observable<ApiResponse> {
        return this.http.delete('api/tasks/' + taskId)
            .map(this.toApiResponse)
            .catch(this.errorHandler);
    }

    refreshToken(): void {
        this.http.post('api/refresh', {}).subscribe();
    }

    private toApiResponse(res: any): ApiResponse {
        let response: ApiResponse = res.json();
        return response;
    }

    private errorHandler(res: any, caught: any): Observable<ApiResponse> {
        let response: ApiResponse = res.json();
        return Observable.of(response);
    }

    private convertBoardData(boardData: any): Board {
        if (boardData instanceof Board) {
            return boardData;
        }

        return new Board(+boardData.id, boardData.name,
                         boardData.is_active === '1',
                         boardData.ownColumn,
                         boardData.ownCategory,
                         boardData.ownAutoAction,
                         boardData.ownIssuetracker,
                         boardData.sharedUser);
    }
}

