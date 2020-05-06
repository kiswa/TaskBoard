import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import {
  ApiResponse,
  Board,
  Column,
  User
} from '../shared/models';
import {
  AuthService,
  ContextMenuService,
  NotificationsService,
  StringsService
} from '../shared/services';
import { BoardService } from './board.service';

@Component({
  selector: 'tb-board',
  templateUrl: './board.component.html',
})
export class BoardDisplayComponent implements OnInit, OnDestroy {
  private subs: any[];

  public categoryFilter: number;
  public userFilter: number;
  public boardNavId: number | null;

  public activeUser: User;
  public activeBoard: Board;
  public boards: Board[];

  public pageName: string;
  public noBoardsMessage: string;

  public strings: any;

  public loading: boolean;
  public hideFiltered: boolean;

  constructor(public title: Title,
              private router: Router,
              public active: ActivatedRoute,
              public auth: AuthService,
              public boardService: BoardService,
              public menuService: ContextMenuService,
              public notes: NotificationsService,
              public stringsService: StringsService) {
    title.setTitle('TaskBoard - Kanban App');

    this.boardNavId = null;
    this.userFilter = null;
    this.categoryFilter = null;

    this.activeBoard = new Board();
    this.activeUser = new User();

    this.boards = [];
    this.subs = [];

    this.loading = true;
    this.hideFiltered = false;

    let sub = stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;

      // Updating the active user updates some display strings.
      this.updateActiveUser(this.activeUser);
    });
    this.subs.push(sub);

    this.pageName = this.strings.boards;

    this.updateBoards();

    sub = boardService.activeBoardChanged.subscribe((board: Board) => {
      if (!board) {
        return;
      }

      this.activeBoard = board;
      title.setTitle('TaskBoard - ' + board.name);
      this.userFilter = null;
      this.categoryFilter = null;
    });
    this.subs.push(sub);

    sub = auth.userChanged.subscribe((user: User) => {
      this.updateActiveUser(user);
    });
    this.subs.push(sub);

    sub = active.params.subscribe(params => {
      const id = +params.id;

      this.boardNavId = id ? id : null;
      this.updateActiveBoard();
    });
    this.subs.push(sub);
  }

  ngOnInit() {
    if (this.boardNavId) {
      return;
    }

    if (this.activeUser && this.activeUser.default_board_id) {
      this.boardNavId = this.activeUser.default_board_id;
      this.goToBoard();
    }
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  goToBoard(): void {
    if (this.boardNavId === null) {
      return;
    }

    this.router.navigate(['/boards/' + this.boardNavId]);
  }

  toggleFiltered() {
    this.activeBoard.columns.forEach(column => {
      column.tasks.forEach(task => {
        task.hideFiltered = this.hideFiltered;
      });
    });
  }

  filterTasks() {
    this.activeBoard.columns.forEach(column => {
      column.tasks.forEach(task => {
        task.filtered = false;

        if (this.userFilter) {
          let found = (this.userFilter === -1 && task.assignees.length === 0);

          if (task.assignees.some(user => user.id === this.userFilter)) {
            found = true;
          }

          task.filtered = !found;
        }

        if (this.categoryFilter) {
          let found = (this.categoryFilter === -1 &&
                      task.categories.length === 0);

          if (task.categories.some(cat => cat.id === this.categoryFilter)) {
            found = true;
          }

          task.filtered = !found;
        }
      });
    });
  }

  updateBoards(): void {
    this.boardService.getBoards().subscribe((response: ApiResponse) => {
      this.boards = [];

      if (response.data.length > 1) {
        this.updateBoardsList(response.data[1]);
      }

      this.loading = false;
    });
  }

  private updateBoardsList(boards: Array<any>): void {
    const activeBoards: Array<Board> = [];

    if (boards) {
      boards.forEach((board: any) => {
        const currentBoard = new Board(+board.id, board.name,
                                       board.is_active === '1',
                                       board.ownColumn,
                                       board.ownCategory,
                                       board.ownAutoAction,
                                       board.ownIssuetracker,
                                       board.sharedUser);
        if (currentBoard.is_active) {
          activeBoards.push(currentBoard);
        }
      });
    }

    this.boards = activeBoards;

    this.boards.forEach(board => {
      board.columns.sort((a: Column, b: Column) => {
        return +a.position - +b.position;
      });
    });

    this.updateActiveBoard();
  }

  private updateActiveBoard(): void {
    if (!this.boardNavId || !this.boards) {
      this.activeBoard = null;
      return;
    }

    const board = this.boards.find(b => (b.id === this.boardNavId));

    if (!board) {
      return;
    }

    this.activeBoard = board;
    this.boardService.updateActiveBoard(board);
    this.pageName = board.name;
  }

  private updateActiveUser(activeUser: User) {
    if (!activeUser) {
      return;
    }

    this.activeUser = new User(+activeUser.default_board_id,
                               activeUser.email,
                               +activeUser.id,
                               activeUser.last_login,
                               +activeUser.security_level,
                               +activeUser.user_option_id,
                               activeUser.username,
                               activeUser.board_access);

    this.noBoardsMessage = this.strings.boards_noBoardsMessageUser;

    if (+activeUser.security_level === 1) {
      this.noBoardsMessage = this.strings.boards_noBoardsMessageAdmin;
    }
  }

}

