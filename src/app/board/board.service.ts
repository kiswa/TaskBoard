import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as marked from 'marked';
import hljs from 'node_modules/highlight.js/lib/core.js';
import javascript from 'node_modules/highlight.js/lib/languages/javascript.js';
import bash from 'node_modules/highlight.js/lib/languages/bash.js';
import css from 'node_modules/highlight.js/lib/languages/css.js';
import csharp from 'node_modules/highlight.js/lib/languages/csharp.js';
import php from 'node_modules/highlight.js/lib/languages/php.js';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  ApiResponse,
  Board,
  Column,
  Attachment,
  Comment,
  Task,
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
  };
  private activeBoard = new BehaviorSubject<Board>(null);

  public activeBoardChanged = this.activeBoard.asObservable();

  constructor(private http: HttpClient) {
    this.initMarked();

    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('bash', bash);
    hljs.registerLanguage('css', css);
    hljs.registerLanguage('csharp', csharp);
    hljs.registerLanguage('php', php);
  }

  async convertMarkdown(markdown: string, callback = this.defaultCallback,
                        doCount = false): Promise<MarkedReturn> {
    this.checkCounts.total = 0;
    this.checkCounts.complete = 0;

    const retVal: MarkedReturn = { html: '', counts: {} };

    retVal.html = callback(false, marked(markdown));

    if (doCount) {
      retVal.counts = Object.assign({}, this.checkCounts);
    }

    return retVal;
  }

  updateActiveBoard(board: any): void {
    if (!board) {
      return;
    }

    this.convertBoardData(board).then(newBoard => {
      this.activeBoard.next(newBoard);
    });
  }

  getBoards(): Observable<ApiResponse> {
    return this.http.get('api/boards')
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  toggleCollapsed(userId: number, columnId: number): Observable<ApiResponse> {
    return this.http.post('api/users/' + userId + '/cols', { id: columnId })
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  updateBoard(board: Board): Observable<ApiResponse> {
    return this.http.post('api/boards/' + board.id, board)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  updateColumn(column: Column): Observable<ApiResponse> {
    return this.http.post('api/columns/' + column.id, column)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  addTask(task: Task): Observable<ApiResponse> {
    return this.http.post('api/tasks', task)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  updateTask(task: Task): Observable<ApiResponse> {
    return this.http.post('api/tasks/' + task.id, task)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  removeTask(taskId: number): Observable<ApiResponse> {
    return this.http.delete('api/tasks/' + taskId)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  getTaskActivity(taskId: number): Observable<ApiResponse> {
    return this.http.get('api/activity/task/' + taskId)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  addComment(comment: Comment): Observable<ApiResponse> {
    return this.http.post('api/comments', comment)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  updateComment(comment: Comment): Observable<ApiResponse> {
    return this.http.post('api/comments/' + comment.id, comment)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  removeComment(commentId: number): Observable<ApiResponse> {
    return this.http.delete('api/comments/' + commentId)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  addAttachment(attachment: Attachment): Observable<ApiResponse> {
    return this.http.post('api/attachments', attachment)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  uploadAttachment(data: FormData, hash: string): Observable<ApiResponse> {
    return this.http.post('api/upload/' + hash, data)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  removeAttachment(id: number): Observable<ApiResponse> {
    return this.http.delete('api/attachments/' + id)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    )
  }

  refreshToken(callback: any): void {
    this.http.post('api/refresh', {}).subscribe(() => callback());
  }

  private async convertBoardData(boardData: any): Promise<Board> {
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

  private defaultCallback = (err: any, text: string) => {
    if (err) {
      return '';
    }

    return text;
  }

  private initMarked(): void {
    const renderer = new marked.Renderer();

    renderer.checkbox = isChecked => {
      const text = '<i class="icon icon-check' + (isChecked ? '' : '-empty') + '"></i>';

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

