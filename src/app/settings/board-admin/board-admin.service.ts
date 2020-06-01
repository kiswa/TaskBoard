import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiResponse } from '../../shared/models';
import { BoardData } from './board-data.model';

@Injectable()
export class BoardAdminService {
  constructor(private http: HttpClient) {
  }

  addBoard(board: BoardData): Observable<ApiResponse> {
    return this.http.post('api/boards', board)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

  editBoard(board: BoardData): Observable<ApiResponse> {
    return this.http.post('api/boards/' + board.id, board)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

  removeBoard(boardId: number): Observable<ApiResponse> {
    return this.http.delete('api/boards/' + boardId)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

}

