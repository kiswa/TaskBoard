import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
  ApiResponse,
  User,
  Board,
  AutoAction
} from '../shared/models';

@Injectable()
export class SettingsService {
  private users = new BehaviorSubject<Array<User>>([]);
  private boards = new BehaviorSubject<Array<Board>>([]);
  private actions = new BehaviorSubject<Array<AutoAction>>([]);

  public usersChanged = this.users.asObservable();
  public boardsChanged = this.boards.asObservable();
  public actionsChanged = this.actions.asObservable();

  constructor(private http: HttpClient) {
  }

  updateUsers(users: Array<User>): void {
    this.users.next(users);
  }

  getUsers(): Observable<ApiResponse> {
    return this.http.get('api/users')
    .map((response: ApiResponse) => {
      return <ApiResponse>response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(<ApiResponse>response);
    });
  }

  updateBoards(boards: Array<Board>): void {
    this.getActions().subscribe((response: ApiResponse) => {
      this.actions.next(response.data[1]);
      this.boards.next(boards);
    });
  }

  getBoards(): Observable<ApiResponse> {
    return this.http.get('api/boards')
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }

  updateActions(actions: Array<AutoAction>): void {
    this.actions.next(actions);
  }

  getActions(): Observable<ApiResponse> {
    return this.http.get('api/autoactions')
    .map((response: ApiResponse) => {
      return response;
    })
    .catch((response: ApiResponse, caught) => {
      return Observable.of(response);
    });
  }
}

