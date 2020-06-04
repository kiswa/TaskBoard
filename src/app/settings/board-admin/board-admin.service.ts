import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiResponse } from '../../shared/models';
import { BoardData } from './board-data.model';
import { ApiService } from 'src/app/shared/services';

@Injectable()
export class BoardAdminService extends ApiService {
  constructor(private http: HttpClient, strat: LocationStrategy) {
    super(strat);
  }

  addBoard(board: BoardData): Observable<ApiResponse> {
    return this.http.post(this.apiBase + 'boards', board)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

  editBoard(board: BoardData): Observable<ApiResponse> {
    return this.http.post(this.apiBase + 'boards/' + board.id, board)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

  removeBoard(boardId: number): Observable<ApiResponse> {
    return this.http.delete(this.apiBase + 'boards/' + boardId)
    .pipe(
      map((response: ApiResponse) =>  response),
      catchError((err) =>  of(err.error as ApiResponse))
    );
  }

}

