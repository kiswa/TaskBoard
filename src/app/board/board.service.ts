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
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
    );
  }

  toggleCollapsed(userId: number, columnId: number): Observable<ApiResponse> {
    return this.http.post('api/users/' + userId + '/cols', { id: columnId })
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
    );
  }

  updateBoard(board: Board): Observable<ApiResponse> {
    return this.http.post('api/boards/' + board.id, board)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
    );
  }

  updateColumn(column: Column): Observable<ApiResponse> {
    return this.http.post('api/columns/' + column.id, column)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
    );
  }

  addTask(task: Task): Observable<ApiResponse> {
    return this.http.post('api/tasks', task)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
    );
  }

  updateTask(task: Task): Observable<ApiResponse> {
    return this.http.post('api/tasks/' + task.id, task)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
    );
  }

  removeTask(taskId: number): Observable<ApiResponse> {
    return this.http.delete('api/tasks/' + taskId)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
    );
  }

  getTaskActivity(taskId: number): Observable<ApiResponse> {
    return this.http.get('api/activity/task/' + taskId)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
    );
  }

  updateComment(comment: Comment): Observable<ApiResponse> {
    return this.http.post('api/comments/' + comment.id, comment)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
    );
  }

  removeComment(commentId: number): Observable<ApiResponse> {
    return this.http.delete('api/comments/' + commentId)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err, caught) => { return caught; })
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

