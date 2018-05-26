import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
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
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  editBoard(board: BoardData): Observable<ApiResponse> {
    return this.http.post('api/boards/' + board.id, board)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

  removeBoard(boardId: number): Observable<ApiResponse> {
    return this.http.delete('api/boards/' + boardId)
    .pipe(
      catchError((err, caught) => { return caught; }),
      map((response: ApiResponse) => { return response; })
    );
  }

}

