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

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private users = new BehaviorSubject<User[]>([]);
  private boards = new BehaviorSubject<Board[]>([]);
  private actions = new BehaviorSubject<AutoAction[]>([]);

  public usersChanged = this.users.asObservable();
  public boardsChanged = this.boards.asObservable();
  public actionsChanged = this.actions.asObservable();

  constructor(private http: HttpClient) {
  }

  updateUsers(users: User[]): void {
    this.users.next(users);
  }

  getUsers(): Observable<ApiResponse> {
    return this.http.get('api/users')
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  updateBoards(boards: Board[]): void {
    this.getActions().subscribe((response: ApiResponse) => {
      this.actions.next(response.data[1]);
      this.boards.next(boards);
    });
  }

  getBoards(): Observable<ApiResponse> {
    return this.http.get('api/boards')
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  updateActions(actions: AutoAction[]): void {
    this.actions.next(actions);
  }

  getActions(): Observable<ApiResponse> {
    return this.http.get('api/autoactions')
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }
}

