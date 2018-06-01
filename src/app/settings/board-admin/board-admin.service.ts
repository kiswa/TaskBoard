import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  ApiResponse,
  Board,
  Column,
  Category,
  IssueTracker,
  User
} from '../../shared/models';
import { BoardData } from './board-data.model';

@Injectable()
export class BoardAdminService {
  constructor(private http: HttpClient) {
  }

  addBoard(board: BoardData): Observable<ApiResponse> {
    return this.http.post('api/boards', board)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  editBoard(board: BoardData): Observable<ApiResponse> {
    return this.http.post('api/boards/' + board.id, board)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  removeBoard(boardId: number): Observable<ApiResponse> {
    return this.http.delete('api/boards/' + boardId)
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

}

