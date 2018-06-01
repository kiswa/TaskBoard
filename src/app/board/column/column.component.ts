import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import * as marked from 'marked';
import * as hljs from 'highlight.js';

import {
  ApiResponse,
  ActivitySimple,
  Board,
  Category,
  Column,
  Comment,
  ContextMenuItem,
  Notification,
  Task,
  User,
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
  selector: 'tb-column',
  templateUrl: './column.component.html'
})
export class ColumnDisplay implements OnInit, OnDestroy {
  private tasks: Array<Task>;
  private viewTaskActivities: Array<ActivitySimple>;

  private MODAL_ID: string;
  private MODAL_VIEW_ID: string;

  private fileUpload: any;
  private subs = [];

  public showActivity: boolean;
  public isOverdue: boolean;
  public isNearlyDue: boolean;
  public showLimitEditor: boolean;
  public taskLimit: number;
  public newComment: string;
  public templateElement: any;
  public strings: any;
  public collapseTasks: boolean;
  public sortOption: string;
  public saving: boolean;
  public taskToRemove: number;

  public commentEdit: Comment;
  public commentToRemove: Comment;
  public viewModalProps: Task;
  public modalProps: Task;
  public userOptions: UserOptions;
  public activeUser: User;
  public activeBoard: Board;
  public contextMenuItems: Array<ContextMenuItem>;
  public quickAdd: Task;

  public MODAL_CONFIRM_ID: string;
  public MODAL_CONFIRM_COMMENT_ID: string;

  @Input('column') columnData: Column;
  @Input('boards') boards: Array<Board>;

  @Output('on-update-boards') onUpdateBoards: EventEmitter<any> = new EventEmitter<any>();

  constructor(private elRef: ElementRef,
              private auth: AuthService,
              private notes: NotificationsService,
              public modal: ModalService,
              private stringsService: StringsService,
              public boardService: BoardService,
              private sanitizer: DomSanitizer) {
    this.templateElement = elRef.nativeElement;
    this.tasks = [];
    this.collapseTasks = false;
    this.sortOption = 'pos';

    this.MODAL_ID = 'add-task-form-';
    this.MODAL_VIEW_ID = 'view-task-form-';
    this.MODAL_CONFIRM_ID = 'task-remove-confirm';
    this.MODAL_CONFIRM_COMMENT_ID = 'comment-remove-confirm';

    this.quickAdd = new Task();
    this.modalProps = new Task();
    this.viewModalProps = new Task();

    let sub = stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;

      this.contextMenuItems = [
        new ContextMenuItem(this.strings.boards_addTask,
                            this.getShowModalFunction())
      ];
    });
    this.subs.push(sub);

    sub = boardService.activeBoardChanged.subscribe((board: Board) => {
      this.activeBoard = board;
    });
    this.subs.push(sub);

    sub = auth.userChanged.subscribe((user: User) => {
      if (user === null) {
        return;
      }

      this.activeUser = new User(+user.default_board_id,
                                 user.email,
                                 +user.id,
                                 user.last_login,
                                 +user.security_level,
                                 +user.user_option_id,
                                 user.username,
                                 user.board_access,
                                 user.collapsed);
      this.userOptions = auth.userOptions;
      this.showActivity = this.activeUser.isAnyAdmin();
    });
    this.subs.push(sub);
  }

  ngOnInit() {
    this.templateElement.classList.remove('double');

    if (this.userOptions && this.userOptions.multiple_tasks_per_row) {
      this.templateElement.classList.add('double');
    }

    if (this.activeUser === undefined) {
      return;
    }

    let isCollapsed = false;

    this.activeUser.collapsed.forEach(id => {
      if (+id === +this.columnData.id) {
        isCollapsed = true;
      }
    });

    if (isCollapsed) {
      this.templateElement.classList.add('collapsed');
    }

    this.sortTasks();
    this.taskLimit = this.columnData.task_limit;
  }

  ngOnDestroy() {
    this.subs.forEach(sub => (sub.unsubscribe()));
  }

  sortTasks() {
    switch (this.sortOption) {
      case 'pos':
        this.columnData.tasks.sort((a, b) => {
          return a.position - b.position;
        });
        break;

      case 'due':
        this.columnData.tasks.sort((a, b) => {
          return new Date(a.due_date).getTime() -
            new Date(b.due_date).getTime();
        });
        break;

      case 'pnt':
        this.columnData.tasks.sort((a, b) => {
          return b.points - a.points;
        });
        break;
    }
  }

  toggleCollapsed() {
    this.templateElement.classList.toggle('collapsed');

    this.boardService.toggleCollapsed(this.activeUser.id, this.columnData.id)
      .subscribe((apiResponse: ApiResponse) => {
        this.activeUser.collapsed = apiResponse.data[1];
        this.auth.updateUser(this.activeUser);
      });
  }

  toggleTaskCollapse() {
    this.collapseTasks = !this.collapseTasks;
  }

  updateTaskColorByCategory(event: Array<Category>) {
    this.modalProps.categories = event;
    this.modalProps.color = event[event.length - 1].default_task_color;
  }

  addTask(newTask: Task = this.modalProps) {
    this.saving = true;

    if (!this.validateTask(newTask)) {
      this.saving = false;
      return;
    }

    this.boardService.addTask(newTask)
      .subscribe((response: ApiResponse) => {
        response.alerts.forEach(note => this.notes.add(note));

        if (response.status !== 'success') {
          this.saving = false;
          return;
        }

        this.modal.close(this.MODAL_ID + (this.columnData
                         ? this.columnData.id + ''
                         : ''));

        let boardData = response.data[2][0];
        boardData.ownColumn.forEach((column: any) => {
          if (!column.ownTask) {
            column.ownTask = [];
          }
        });

        this.boardService.updateActiveBoard(boardData);
        this.boardService.refreshToken();
        this.saving = false;
      });
  }

  updateTask() {
    this.saving = true;

    if (!this.validateTask(this.modalProps)) {
      this.saving = false;
      return;
    }

    this.boardService.updateTask(this.modalProps)
      .subscribe((response: ApiResponse) => {
        response.alerts.forEach(note => this.notes.add(note));

        if (response.status !== 'success') {
          this.saving = false;
          return;
        }

        this.boardService.updateActiveBoard(response.data[2][0]);
        this.modal.close(this.MODAL_ID + (this.columnData
                         ? this.columnData.id + ''
                         : ''));

        this.boardService.refreshToken();
        this.saving = false;
      });
  }

  removeTask() {
    this.boardService.removeTask(this.taskToRemove)
      .subscribe((response: ApiResponse) => {
        response.alerts.forEach(note => this.notes.add(note));

        if (response.status !== 'success') {
          return;
        }

        this.boardService.updateActiveBoard(response.data[1][0]);
        this.boardService.refreshToken();
      });
  }

  fileChange(file: File) {
    this.fileUpload = file;
  }

  uploadFile() {
    let formData = new FormData();
    formData.append('file', this.fileUpload, this.fileUpload.name);

    let headers = new Headers();

    console.log(formData, headers); // tslint:disable-line
  }

  addComment() {
    if (this.viewModalProps.id < 1) {
      return;
    }

    this.viewModalProps.comments.push(
      new Comment(0, this.newComment, this.activeUser.id,
                  this.viewModalProps.id));

    this.newComment = '';

    this.boardService.updateTask(this.viewModalProps)
      .subscribe((response: ApiResponse) => {
        if (response.status !== 'success') {
          return;
        }

        let updatedTask = response.data[1][0];
        this.replaceUpdatedTask(updatedTask);

        this.viewModalProps = this.convertToTask(updatedTask);
      });
  }

  beginEditComment(comment: Comment) {
    this.commentEdit = { ...comment };
  }

  editComment() {
    this.commentEdit.is_edited = true;
    this.commentEdit.user_id = this.activeUser.id;

    this.boardService.updateComment(this.commentEdit)
      .subscribe((response: ApiResponse) => {
        response.alerts.forEach(note => this.notes.add(note));

        if (response.status !== 'success') {
          return;
        }

        let updatedTask = response.data[1][0];
        this.replaceUpdatedTask(updatedTask);

        this.viewModalProps = this.convertToTask(updatedTask);
      });
  }

  removeComment() {
    for (let i = this.viewModalProps.comments.length - 1; i >= 0; --i) {
      if (this.viewModalProps.comments[i].id === this.commentToRemove.id) {
        this.viewModalProps.comments.splice(i, 1);
      }
    }

    this.boardService.removeComment(this.commentToRemove.id)
      .subscribe((response: ApiResponse) => {
        response.alerts.forEach(note => this.notes.add(note));

        let updatedTask = response.data[1][0];
        this.replaceUpdatedTask(updatedTask);
      });
  }

  canAdminComment(comment: Comment) {
    if (this.activeUser.id === comment.user_id) {
      return true;
    }

    return this.activeUser.isAnyAdmin();
  }

  beginLimitEdit() {
    this.taskLimit = this.columnData.task_limit;
    this.showLimitEditor = true;
  }

  cancelLimitChanges() {
    this.showLimitEditor = false;
  }

  saveLimitChanges() {
    let originalLimit = this.columnData.task_limit;

    this.columnData.task_limit = this.taskLimit;

    this.boardService.updateColumn(this.columnData)
      .subscribe((response: ApiResponse) => {
        response.alerts.forEach(note => this.notes.add(note));

        if (response.status !== 'success') {
          this.columnData.task_limit = originalLimit;
          return;
        }

        let colData = response.data[1][0];
        this.columnData = new Column(colData.id,
                                     colData.name,
                                     colData.position,
                                     colData.board_id,
                                     colData.task_limit,
                                     colData.ownTask);
      });

    this.showLimitEditor = false;
  }

  // Expects a color in full HEX with leading #, e.g. #ffffe0
  getTextColor(color: string): string {
    let r = parseInt(color.substr(1, 2), 16),
      g = parseInt(color.substr(3, 2), 16),
      b = parseInt(color.substr(5, 2), 16),
      yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return yiq >= 140 ? '#333333' : '#efefef';
  }

  quickAddClicked(event: any) {
    this.preventEnter(event);

    if (this.quickAdd.title === '') {
      this.showModal();
      return;
    }

    this.quickAdd.column_id = this.columnData.id;
    this.addTask(this.quickAdd);

    this.quickAdd = new Task();
  }

  checkDueDate() {
    if (this.viewModalProps.due_date === '') {
      return;
    }

    let dueDate = new Date(this.viewModalProps.due_date);

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

  getRemoveTaskFunction(taskId: number): Function {
    return () => {
      this.taskToRemove = taskId;
      this.modal.open(this.MODAL_CONFIRM_ID + this.columnData.id);
    };
  }

  getShowModalFunction(taskId: number = 0): Function {
    return () => { this.showModal(taskId); };
  }

  getShowViewModalFunction(taskId: number): Function {
    return () => { this.showViewModal(taskId); };
  }

  private convertToTask(updatedTask: any) {
    let task = new Task(updatedTask.id,
                        updatedTask.title,
                        updatedTask.description,
                        updatedTask.color,
                        updatedTask.due,
                        updatedTask.points,
                        updatedTask.position,
                        updatedTask.column_id,
                        updatedTask.ownComment,
                        updatedTask.ownAttachment,
                        updatedTask.sharedUser,
                        updatedTask.sharedCategory);
    return task;
  }

  private replaceUpdatedTask(updatedTask: any) {
    this.activeBoard.columns.forEach(column => {
      if (+column.id !== +updatedTask.column_id) {
        return;
      }

      column.tasks.forEach(task => {
        if (+task.id !== +updatedTask.id) {
          return;
        }

        this.updateTaskComments(task, updatedTask.ownComment);
      });
    });
  }

  private updateTaskComments(task: Task, newComments: Array<any>) {
    task.comments = [];

    newComments.forEach(comment => {
      task.comments.push(
        new Comment(comment.id, comment.text, comment.user_id,
                    comment.task_id, comment.timestamp)
      );
    });
  }

  // Needs anonymous function for proper `this` context.
  private markedCallback = (error: any, text: string) => {
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

  private getTaskDescription() {
    let html = marked(this.viewModalProps.description, this.markedCallback);
    return html.replace(/(\{)([^}]+)(\})/g, '{{ "{" }}$2{{ "}" }}');
  }

  private getComment(text: string) {
    let html = marked(text, this.markedCallback);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private getUserName(userId: number) {
    let user = this.activeBoard.users.find((test: User) => test.id === userId);

    return user.username;
  }

  private validateTask(task: Task) {
    if (task.title === '') {
      this.notes.add(
        new Notification('error', 'Task title is required.'));
      return false;
    }

    return true;
  }

  private callBoardUpdate() {
    this.onUpdateBoards.emit();
  }

  private showViewModal(taskId: number) {
    let viewTask = this.columnData.tasks.find(task => task.id === taskId);

    this.viewTaskActivities = [];
    this.boardService.getTaskActivity(viewTask.id)
      .subscribe(response => {
        response.data[1].forEach((item: any) => {
          this.viewTaskActivities.push(
            new ActivitySimple(item.text, item.timestamp));
        });
      });

    this.newComment = '';
    this.viewModalProps = new Task(viewTask.id, viewTask.title,
                                   viewTask.description, viewTask.color,
                                   viewTask.due_date, viewTask.points,
                                   viewTask.position, viewTask.column_id,
                                   viewTask.comments, viewTask.attachments,
                                   viewTask.assignees, viewTask.categories);
    this.checkDueDate();

    if (this.showActivity) {
      this.showActivity = false;
      setTimeout(() => (this.showActivity = true), 500);
    }

    this.modal.open(this.MODAL_VIEW_ID + this.columnData.id);
  }

  private showModal(taskId: number = 0) {
    if (taskId === 0) {
      this.modalProps = new Task();
      this.modalProps.column_id = this.columnData.id;

      this.modal.open(this.MODAL_ID + this.columnData.id);
      return;
    }

    let editTask = this.columnData.tasks.find(task => task.id === taskId);

    this.modalProps = new Task(editTask.id, editTask.title,
                               editTask.description, editTask.color,
                               editTask.due_date, editTask.points,
                               editTask.position, editTask.column_id,
                               editTask.comments, editTask.attachments,
                               [], []);

    this.activeBoard.users.forEach(user => {
      editTask.assignees.forEach(assignee => {
        if (assignee.id === user.id) {
          this.modalProps.assignees.push(user);
        }
      });
    });

    this.activeBoard.categories.forEach(category => {
      editTask.categories.forEach(cat => {
        if (cat.id === category.id) {
          this.modalProps.categories.push(category);
        }
      });
    });

    this.modal.open(this.MODAL_ID + this.columnData.id);
  }

  private preventEnter(event: any) {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
  }
}

