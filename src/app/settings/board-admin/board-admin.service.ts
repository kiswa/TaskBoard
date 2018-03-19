import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

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
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  editBoard(board: BoardData): Observable<ApiResponse> {
    return this.http.post('api/boards/' + board.id, board)
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  removeBoard(boardId: number): Observable<ApiResponse> {
    return this.http.delete('api/boards/' + boardId)
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

}

