import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  ApiResponse,
  User,
  Board,
  AutoAction
} from '../shared/models';
import { ApiService } from '../shared/services';

@Injectable({
  providedIn: 'root'
})
export class SettingsService extends ApiService {
  private users = new BehaviorSubject<User[]>([]);
  private boards = new BehaviorSubject<Board[]>([]);
  private actions = new BehaviorSubject<AutoAction[]>([]);

  public usersChanged = this.users.asObservable();
  public boardsChanged = this.boards.asObservable();
  public actionsChanged = this.actions.asObservable();

  constructor(private http: HttpClient, strat: LocationStrategy) {
    super(strat);
  }

  updateUsers(users: User[]): void {
    this.users.next(users);
  }

  getUsers(): Observable<ApiResponse> {
    return this.http.get(this.apiBase + 'users')
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
    return this.http.get(this.apiBase + 'boards')
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

  updateActions(actions: AutoAction[]): void {
    this.actions.next(actions);
  }

  getActions(): Observable<ApiResponse> {
    return this.http.get(this.apiBase + 'autoactions')
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }
}

