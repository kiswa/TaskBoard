import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
  ApiResponse,
  Board,
  Column,
  Comment,
  Task,
  User
} from '../shared/models';

@Injectable()
export class BoardService {
  private activeBoard = new BehaviorSubject<Board>(null);

  public activeBoardChanged = this.activeBoard.asObservable();

  constructor(private http: HttpClient) {
  }

  updateActiveBoard(board: Board): void {
    let newBoard = this.convertBoardData(board);
    this.activeBoard.next(newBoard);
  }

  getBoards(): Observable<ApiResponse> {
    return this.http.get('api/boards')
    .map((response: ApiResponse) => response)
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  toggleCollapsed(userId: number, columnId: number): Observable<ApiResponse> {
    return this.http.post('api/users/' + userId + '/cols',
      { id: columnId })
    .map((response: ApiResponse) => response)
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  updateBoard(board: Board): Observable<ApiResponse> {
    return this.http.post('api/boards/' + board.id, board)
    .map((response: ApiResponse) => response)
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  updateColumn(column: Column): Observable<ApiResponse> {
    return this.http.post('api/columns/' + column.id, column)
    .map((response: ApiResponse) => response)
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  addTask(task: Task): Observable<ApiResponse> {
    return this.http.post('api/tasks', task)
    .map((response: ApiResponse) => response)
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  updateTask(task: Task): Observable<ApiResponse> {
    return this.http.post('api/tasks/' + task.id, task)
    .map((response: ApiResponse) => response)
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  removeTask(taskId: number): Observable<ApiResponse> {
    return this.http.delete('api/tasks/' + taskId)
    .map((response: ApiResponse) => response)
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  getTaskActivity(taskId: number): Observable<ApiResponse> {
    return this.http.get('api/activity/task/' + taskId)
    .map((response: ApiResponse) => response)
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  updateComment(comment: Comment): Observable<ApiResponse> {
    return this.http.post('api/comments/' + comment.id, comment)
    .map((response: ApiResponse) => response)
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  removeComment(commentId: number): Observable<ApiResponse> {
    return this.http.delete('api/comments/' + commentId)
    .map((response: ApiResponse) => response)
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  refreshToken(): void {
    this.http.post('api/refresh', {}).subscribe();
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

