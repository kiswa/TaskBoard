import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import {
  ApiResponse,
  Board,
  Column,
  Notification,
  Task,
  UserOptions
} from '../../shared/models';
import {
  AuthService,
  ModalService,
  NotificationsService,
  StringsService
} from '../../shared/services';
import { BoardService } from '../board.service';

@Component({
  selector: 'tb-task',
  templateUrl: './task.component.html'
})
export class TaskDisplay implements OnInit {
  private isOverdue: boolean;
  private isNearlyDue: boolean;

  public strings: any;
  public percentComplete: number;
  public activeBoard: Board;
  public userOptions: UserOptions;
  public boardsList: Array<Board>;

  @Input('task') taskData: Task;
  @Input('add-task') addTask: Function;
  @Input('edit-task') editTask: Function;
  @Input('view-task') viewTask: Function;
  @Input('remove-task') removeTask: Function;
  @Input('collapse') isCollapsed: boolean;

  @Output('on-update-boards') onUpdateBoards: EventEmitter<any>;

  @Input('boards')
  set boards(boards: Array<Board>) {
    this.boardsList = boards;
  }

  constructor(private auth: AuthService,
              private sanitizer: DomSanitizer,
              public boardService: BoardService,
              private modal: ModalService,
              private notes: NotificationsService,
              private stringsService: StringsService) {
    this.onUpdateBoards = new EventEmitter<any>();
    this.percentComplete = 0;

    stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;
    });

    auth.userChanged.subscribe(() => {
      this.userOptions = auth.userOptions;
    });

    boardService.activeBoardChanged.subscribe((board: Board) => {
      this.activeBoard = board;
    });
  }

  ngOnInit() {
    this.checkDueDate();
    this.convertTaskDescription();
  }

  private convertTaskDescription() {
    if (!this.taskData || !this.taskData.description) {
      return;
    }

    let data = this.boardService.convertMarkdown(
      this.taskData.description, this.markedCallback, true
    );

    data.html.replace(/(\{)([^}]+)(\})/g, '{{ "{" }}$2{{ "}"  }}');
    if (data.counts.total) {
      this.percentComplete = data.counts.complete / data.counts.total;
    }

    this.taskData.html = this.sanitizer.bypassSecurityTrustHtml(data.html);
  }

  getPercentStyle() {
    return this.sanitizer.bypassSecurityTrustStyle(
      'padding: 0; height: 5px; background-color: rgba(0, 0, 0, .4); ' +
      'width: ' + (this.percentComplete * 100) + '%;');
  }

  getPercentTitle() {
    return this.strings.boards_task + ' ' +
      (this.percentComplete * 100).toFixed(0) + '% ' +
      this.strings.boards_taskComplete;
  }

  // Expects a color in full HEX with leading #, e.g. #ffffe0
  getTextColor(color: string): string {
    let r = parseInt(color.substr(1, 2), 16),
      g = parseInt(color.substr(3, 2), 16),
      b = parseInt(color.substr(5, 2), 16),
      yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return yiq >= 140 ? '#333333' : '#efefef';
  }

  changeTaskColumn(event: any) {
    if (event.target.tagName !== 'SELECT') {
      return;
    }
    event.target.parentElement.parentElement.click();

    let select = document.getElementById('columnsList' + this.taskData.id) as HTMLSelectElement,
      id = +select[select.selectedIndex].value;

    if (id === 0) {
      return;
    }

    this.taskData.column_id = id;

    this.boardService.updateTask(this.taskData)
      .subscribe((response: ApiResponse) => {
        response.alerts.forEach(note => this.notes.add(note));

        if (response.status === 'success') {
          this.boardService.updateActiveBoard(response.data[2][0]);
        }
      });
  }

  copyTaskToBoard(event: any) {
    if (event.target.tagName !== 'SELECT') {
      return;
    }
    event.target.parentElement.parentElement.click();

    let select = document.getElementById('boardsList' + this.taskData.id +
      this.strings.boards_copyTaskTo.split(' ')[0]) as HTMLSelectElement;

    let newBoardId = +select[select.selectedIndex].value;
    let taskData = { ...this.taskData };
    let boardData: Board;

    this.boardsList.forEach(board => {
      if (board.id === newBoardId) {
        taskData.column_id = board.columns[0].id;
        boardData = board;
      }
    });

    this.boardService.addTask(taskData)
      .subscribe((response: ApiResponse) => {
        if (response.status === 'success') {
          this.notes.add(
            new Notification('success',
              this.strings.boards_task +
              ' ' + taskData.title + ' ' +
              this.strings.boards_taskCopied +
              ' ' + boardData.name));
          this.onUpdateBoards.emit();

          return;
        }

        response.alerts.forEach(note => this.notes.add(note));
      });
  }

  moveTaskToBoard(event: any) {
    if (event.target.tagName !== 'SELECT') {
      return;
    }
    event.target.parentElement.parentElement.click();

    let select = document.getElementById('boardsList' + this.taskData.id +
      this.strings.boards_moveTaskTo.split(' ')[0]) as HTMLSelectElement;

    let newBoardId = +select[select.selectedIndex].value;
    let boardData: Board;

    this.boardsList.forEach(board => {
      if (board.id === newBoardId) {
        this.taskData.column_id = board.columns[0].id;
        boardData = board;
      }
    });

    this.boardService.updateTask(this.taskData)
      .subscribe((response: ApiResponse) => {
        if (response.status === 'success') {
          this.notes.add(
            new Notification('success',
              this.strings.boards_task +
              ' ' + this.taskData.title + ' ' +
              this.strings.boards_taskMoved +
              ' ' + boardData.name));
          this.onUpdateBoards.emit();

          return;
        }

        response.alerts.forEach(note => this.notes.add(note));
      });
  }

  private checkDueDate() {
    if (!this.taskData || this.taskData.due_date === '') {
      return;
    }

    let dueDate = new Date(this.taskData.due_date);

    if (isNaN(dueDate.valueOf())) {
      return;
    }

    let millisecondsPerDay = (1000 * 3600 * 24),
      today = new Date(),
      timeDiff = today.getTime() - dueDate.getTime(),
      daysDiff = Math.ceil(timeDiff / millisecondsPerDay);

    if (daysDiff > 0) {
      // past due date
      this.isOverdue = true;
    }

    if (daysDiff <= 0 && daysDiff > -3) {
      this.isNearlyDue = true;
    }
  }

  // Needs anonymous function for proper `this` context.
  private markedCallback = (error: any, text: string) => {
    if (!this.activeBoard.issue_trackers) {
      return;
    }

    this.activeBoard.issue_trackers.forEach(tracker => {
      let re = new RegExp(tracker.regex, 'ig');
      let replacements = new Array<any>();
      let result = re.exec(text);

      while (result !== null) {
        let link = '<a href="' +
          tracker.url.replace(/%BUGID%/g, result[1]) +
          '" target="tb_external" rel="noreferrer">' +
          result[0] + '</a>';

        replacements.push({
          str: result[0],
          link
        });
        result = re.exec(text);
      }

      for (let i = replacements.length - 1; i >= 0; --i) {
        text = text.replace(replacements[i].str,
          replacements[i].link);
      }
    });

    return text;
  }
}

