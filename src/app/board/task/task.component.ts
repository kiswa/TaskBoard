import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import {
  ApiResponse,
  Board,
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
export class TaskDisplayComponent implements OnInit {
  public isOverdue: boolean;
  public isNearlyDue: boolean;
  public strings: any;
  public percentComplete: number;
  public activeBoard: Board;
  public userOptions: UserOptions;
  public boardsList: Array<Board>;

  // tslint:disable-next-line
  @Input('task') taskData: Task;
  // tslint:disable-next-line
  @Input('add-task') addTask: Function;
  // tslint:disable-next-line
  @Input('edit-task') editTask: Function;
  // tslint:disable-next-line
  @Input('view-task') viewTask: Function;
  // tslint:disable-next-line
  @Input('remove-task') removeTask: Function;
  // tslint:disable-next-line
  @Input('collapse') isCollapsed: boolean;

  // tslint:disable-next-line
  @Output('on-update-boards') onUpdateBoards: EventEmitter<any>;

  @Input('boards')
  set boards(boards: Array<Board>) {
    this.boardsList = boards;
  }

  constructor(public auth: AuthService,
              private sanitizer: DomSanitizer,
              public boardService: BoardService,
              public modal: ModalService,
              private notes: NotificationsService,
              public stringsService: StringsService) {
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
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return yiq >= 140 ? '#333333' : '#efefef';
  }

  changeTaskColumn(event: any) {
    if (event.target.tagName !== 'SELECT') {
      return;
    }
    event.target.parentElement.parentElement.click();

    const select = document.getElementById('columnsList' + this.taskData.id) as
      HTMLSelectElement;
    const id = +(select[select.selectedIndex] as HTMLOptionElement).value;

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

    const select = document.getElementById('boardsList' + this.taskData.id +
      this.strings.boards_copyTaskTo.split(' ')[0]) as HTMLSelectElement;

    const newBoardId = +(select[select.selectedIndex] as HTMLOptionElement).value;
    const taskData = { ...this.taskData };
    const boardData = this.boardsList.find(board => board.id === newBoardId);

    taskData.column_id = boardData.columns[0].id;

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

    const select = document.getElementById('boardsList' + this.taskData.id +
      this.strings.boards_moveTaskTo.split(' ')[0]) as HTMLSelectElement;

    const newBoardId = +(select[select.selectedIndex] as HTMLOptionElement).value;
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

  private convertTaskDescription() {
    if (!this.taskData || !this.taskData.description) {
      return;
    }

    const data = this.boardService.convertMarkdown(
      this.taskData.description, this.markedCallback, true
    );

    data.html.replace(/(\{)([^}]+)(\})/g, '{{ "{" }}$2{{ "}"  }}');
    if (data.counts.total) {
      this.percentComplete = data.counts.complete / data.counts.total;
    }

    this.taskData.html = this.sanitizer.bypassSecurityTrustHtml(data.html);
  }

  private checkDueDate() {
    if (!this.taskData || this.taskData.due_date === '') {
      return;
    }

    const dueDate = new Date(this.taskData.due_date);

    if (isNaN(dueDate.valueOf())) {
      return;
    }

    const millisecondsPerDay = (1000 * 3600 * 24);
    const today = new Date();
    const timeDiff = today.getTime() - dueDate.getTime();
    const daysDiff = Math.ceil(timeDiff / millisecondsPerDay);

    if (daysDiff > 0) {
      // past due date
      this.isOverdue = true;
    }

    if (daysDiff <= 0 && daysDiff > -3) {
      this.isNearlyDue = true;
    }
  }

  // Needs anonymous function for proper `this` context.
  private markedCallback = (_: any, text: string) => {
    if (!this.activeBoard.issue_trackers) {
      return;
    }

    this.activeBoard.issue_trackers.forEach(tracker => {
      const re = new RegExp(tracker.regex, 'ig');
      const replacements = new Array<any>();
      let result = re.exec(text);

      while (result !== null) {
        const link = '<a href="' +
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

