import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  updateBoards(boards: Array<Board>): void {
    this.getActions().subscribe((response: ApiResponse) => {
      this.actions.next(response.data[1]);
      this.boards.next(boards);
    });
  }

  getBoards(): Observable<ApiResponse> {
    return this.http.get('api/boards')
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }

  updateActions(actions: Array<AutoAction>): void {
    this.actions.next(actions);
  }

  getActions(): Observable<ApiResponse> {
    return this.http.get('api/autoactions')
    .pipe(
      map((response: ApiResponse) => { return response; }),
      catchError((err) => { return of(<ApiResponse>err.error); })
    );
  }
}

