import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
    ApiResponse,
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
        this.activeBoard.next(board);
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

    toggleCollapsed(userId: number, columnId: number): Observable<ApiResponse> {
        return this.http.post('api/users/' + userId + '/cols',
                              { id: columnId })
            .map(res => {
                let response: ApiResponse = res.json();
                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                return Observable.of(response);
            });
    }

    addTask(task: Task): Observable<ApiResponse> {
        return this.http.post('api/tasks', task)
            .map(res => {
                let response: ApiResponse = res.json();
                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                return Observable.of(response);
            });
    }

    removeTask(taskId: number): Observable<ApiResponse> {
        return this.http.delete('api/tasks/' + taskId)
            .map(res => {
                let response: ApiResponse = res.json();
                return response;
            })
            .catch((res, caught) => {
                let response: ApiResponse = res.json();
                return Observable.of(response);
            });
    }

    // TODO: Determine when to use this
    refreshToken(): void {
        this.http.post('api/refresh', {}).subscribe();
    }
}

