import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  toggleCollapsed(userId: number, columnId: number): Observable<ApiResponse> {
    return this.http.post('api/users/' + userId + '/cols', { id: columnId })
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  updateBoard(board: Board): Observable<ApiResponse> {
    return this.http.post('api/boards/' + board.id, board)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  updateColumn(column: Column): Observable<ApiResponse> {
    return this.http.post('api/columns/' + column.id, column)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  addTask(task: Task): Observable<ApiResponse> {
    return this.http.post('api/tasks', task)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  updateTask(task: Task): Observable<ApiResponse> {
    return this.http.post('api/tasks/' + task.id, task)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  removeTask(taskId: number): Observable<ApiResponse> {
    return this.http.delete('api/tasks/' + taskId)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  getTaskActivity(taskId: number): Observable<ApiResponse> {
    return this.http.get('api/activity/task/' + taskId)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  updateComment(comment: Comment): Observable<ApiResponse> {
    return this.http.post('api/comments/' + comment.id, comment)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  removeComment(commentId: number): Observable<ApiResponse> {
    return this.http.delete('api/comments/' + commentId)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
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

