import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as marked from 'marked';
import * as hljs from 'highlight.js';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  ApiResponse,
  Board,
  Column,
  Comment,
  Task,
  User
} from '../shared/models';

interface MarkedReturn {
  html: string;
  counts: any;
}

@Injectable()
export class BoardService {
  private checkCounts = {
    total: 0,
    complete: 0
  }
  private activeBoard = new BehaviorSubject<Board>(null);
  private defaultCallback = (err: any, text: string) => {
    console.log('default', err, text);
    return text;
  };

  public activeBoardChanged = this.activeBoard.asObservable();

  constructor(private http: HttpClient) {
    this.initMarked();
  }

  convertMarkdown(markdown: string, callback = this.defaultCallback, doCount = false): MarkedReturn {
    this.checkCounts.total = 0;
    this.checkCounts.complete = 0;

    let retVal: MarkedReturn = { html: '', counts: {} };

    retVal.html = marked(markdown, callback);

    if (doCount) {
      retVal.counts = this.checkCounts;
    }

    return retVal;
  }

  updateActiveBoard(board: Board): void {
    let newBoard = this.convertBoardData(board);
    this.activeBoard.next(newBoard);
  }

  getBoards(): Observable<ApiResponse> {
    return this.http.get('api/boards')
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  toggleCollapsed(userId: number, columnId: number): Observable<ApiResponse> {
    return this.http.post('api/users/' + userId + '/cols', { id: columnId })
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  updateBoard(board: Board): Observable<ApiResponse> {
    return this.http.post('api/boards/' + board.id, board)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  updateColumn(column: Column): Observable<ApiResponse> {
    return this.http.post('api/columns/' + column.id, column)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  addTask(task: Task): Observable<ApiResponse> {
    return this.http.post('api/tasks', task)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  updateTask(task: Task): Observable<ApiResponse> {
    return this.http.post('api/tasks/' + task.id, task)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  removeTask(taskId: number): Observable<ApiResponse> {
    return this.http.delete('api/tasks/' + taskId)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  getTaskActivity(taskId: number): Observable<ApiResponse> {
    return this.http.get('api/activity/task/' + taskId)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  updateComment(comment: Comment): Observable<ApiResponse> {
    return this.http.post('api/comments/' + comment.id, comment)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  removeComment(commentId: number): Observable<ApiResponse> {
    return this.http.delete('api/comments/' + commentId)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
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

  private initMarked(): void {
    let renderer = new marked.Renderer();

    renderer.checkbox = isChecked => {
      let text = '<i class="icon icon-check' + (isChecked ? '' : '-empty') + '"></i>';

      this.checkCounts.total += 1;

      if (isChecked) {
        this.checkCounts.complete += 1;
      }

      return text;
    };

    renderer.link = (href, title, text) => {
      let out = '<a href="' + href + '"';

      if (title) {
        out += ' title="' + title + '"';
      }

      out += ' target="tb_external" rel="noreferrer">' + text + '</a>';

      return out;
    };

    marked.setOptions({
      renderer,
      smartypants: true,
      highlight: code => {
        return hljs.highlightAuto(code).value;
      }
    });
  }

}

