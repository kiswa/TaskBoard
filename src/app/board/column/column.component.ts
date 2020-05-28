import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';

import {
  ApiResponse,
  ActivitySimple,
  Attachment,
  Board,
  Category,
  Column,
  Comment,
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
  templateUrl: './column.component.html',
})
export class ColumnDisplayComponent implements OnInit, OnDestroy {
  public moveItemInArray: any;
  public transferArrayItem: any;
  public fileUpload: any;

  private subs = [];

  public viewTaskActivities: ActivitySimple[];

  public fileUploading: boolean;
  public showActivity: boolean;
  public collapseActivity: boolean;
  public isOverdue: boolean;
  public isNearlyDue: boolean;
  public showLimitEditor: boolean;
  public collapseTasks: boolean;
  public saving: boolean;

  public taskLimit: number;
  public taskToRemove: number;

  public newComment: string;
  public sortOption: string;

  public templateElement: any;
  public strings: any;

  public commentEdit: Comment;
  public commentToRemove: Comment;
  public attachmentToRemove: Attachment;
  public viewModalProps: Task;
  public modalProps: Task;
  public userOptions: UserOptions;
  public activeUser: User;
  public activeBoard: Board;
  public quickAdd: Task;

  public MODAL_ID: string;
  public MODAL_VIEW_ID: string;
  public MODAL_CONFIRM_ID: string;
  public MODAL_CONFIRM_ATTACHMENT_ID: string;
  public MODAL_CONFIRM_COMMENT_ID: string;

  // tslint:disable-next-line
  @Input('column') columnData: Column;

  // tslint:disable-next-line
  @Output('on-update-boards')
  onUpdateBoards: EventEmitter<any> = new EventEmitter<any>();

  constructor(public elRef: ElementRef,
              private auth: AuthService,
              public notes: NotificationsService,
              public modal: ModalService,
              public stringsService: StringsService,
              public boardService: BoardService,
              private sanitizer: DomSanitizer) {
    this.templateElement = elRef.nativeElement;
    this.collapseTasks = false;
    this.sortOption = 'pos';

    this.MODAL_ID = 'add-task-form-';
    this.MODAL_VIEW_ID = 'view-task-form-';
    this.MODAL_CONFIRM_ID = 'task-remove-confirm';
    this.MODAL_CONFIRM_ATTACHMENT_ID = 'attachment-remove-confirm';
    this.MODAL_CONFIRM_COMMENT_ID = 'comment-remove-confirm';

    this.quickAdd = new Task();
    this.modalProps = new Task();
    this.viewModalProps = new Task();

    // These are kept locally to allow override in tests.
    this.moveItemInArray = moveItemInArray;
    this.transferArrayItem = transferArrayItem;

    let sub = stringsService.stringsChanged.subscribe(newStrings => {
      this.strings = newStrings;
    });
    this.subs.push(sub);

    sub = boardService.activeBoardChanged.subscribe(newBoard => {
      this.activeBoard = newBoard;
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

  userName(id: number) {
    const user = this.activeBoard.users.find(u => u.id === id);

    return user ? user.username : this.strings.none;
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

  updateTaskColorByCategory(event: Category[]) {
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

        this.modal.close(this.MODAL_ID + this.columnData.id + '');

        const boardData = response.data[2][0];
        boardData.ownColumn.forEach((column: any) => {
          if (!column.ownTask) {
            column.ownTask = [];
          }
        });

        this.boardService.updateActiveBoard(boardData);
        this.boardService.refreshToken();
        this.saving = false;
      }, err => {
        this.notes.add({ type: 'error', text: err.toString() });
      });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.moveItemInArray(event.container.data,
        event.previousIndex, event.currentIndex);
    } else {
      this.transferArrayItem(event.previousContainer.data,
        event.container.data, event.previousIndex, event.currentIndex);
    }

    const colId = (event.container.element.nativeElement.id).substring(3);
    const colIndex = this.activeBoard.columns.findIndex(col => +col.id === +colId);

    this.activeBoard.columns[colIndex].tasks.forEach((item, index) => {
      item.position = index + 1;
      item.column_id = this.activeBoard.columns[colIndex].id;
    });

    const task = this.activeBoard.columns[colIndex].tasks[event.currentIndex];
    this.boardService.updateTask(task).subscribe(() => {});
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
        this.modal.close(this.MODAL_ID + this.columnData?.id + '');

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

  addFile() {
    if (!this.fileUpload) {
      this.notes
        .add({ type: 'error', text: this.strings.boards_taskNoFileError });
      return;
    }

    this.fileUploading = true;
    const attachment = new Attachment();

    attachment.filename = this.fileUpload.name;
    attachment.name = attachment.filename.split('.').slice(0, -1).join('.');
    attachment.type = this.fileUpload.type;
    attachment.user_id = this.activeUser.id;
    attachment.task_id = this.viewModalProps.id;

    this.boardService.addAttachment(attachment).subscribe(response => {
      if (response.status !== 'success') {
        this.fileUploading = false;
        this.resetFileInput();

        return;
      }

      attachment.id = response.data[1].id;
      attachment.diskfilename = response.data[1].diskfilename;

      this.uploadFile(attachment, response);
    });
  }

  viewFile(hash: string) {
    window.open(`./files/${hash}`, 'tb-file-view');
  }

  getUrl(hash: string) {
    const url = `./api/uploads/${hash}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  removeAttachment() {
    this.boardService.removeAttachment(this.attachmentToRemove.id)
      .subscribe(res => {
        res.alerts.forEach(note => this.notes.add(note));

        if (res.status === 'success') {
          const index = this.viewModalProps.attachments
            .findIndex(x => x.id === this.attachmentToRemove.id);

          this.viewModalProps.attachments.splice(index, 1);
          this.updateTaskActivity(this.viewModalProps.id);
        }
      });
  }

  addComment() {
    if (this.viewModalProps.id < 1) {
      return;
    }

    const comment = new Comment(0, this.newComment, this.activeUser.id,
      this.viewModalProps.id);

    this.newComment = '';

    this.boardService.addComment(comment)
      .subscribe((response: ApiResponse) => {
        response.alerts.forEach(note => this.notes.add(note));

        if (response.status !== 'success') {
          return;
        }

        const updatedTask = response.data[1][0];
        this.replaceUpdatedTask(updatedTask);

        this.viewModalProps = this.convertToTask(updatedTask);
        this.updateTaskActivity(this.viewModalProps.id);
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

        const updatedTask = response.data[1][0];
        this.replaceUpdatedTask(updatedTask);

        this.viewModalProps = this.convertToTask(updatedTask);
        this.updateTaskActivity(this.viewModalProps.id);
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

        const updatedTask = response.data[1][0];
        this.replaceUpdatedTask(updatedTask);
        this.updateTaskActivity(this.viewModalProps.id);
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
    const originalLimit = this.columnData.task_limit;

    this.columnData.task_limit = this.taskLimit;

    this.boardService.updateColumn(this.columnData)
      .subscribe((response: ApiResponse) => {
        response.alerts.forEach(note => this.notes.add(note));

        if (response.status !== 'success') {
          this.columnData.task_limit = originalLimit;
          return;
        }

        const colData = response.data[1][0];
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
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

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

    const dueDate = new Date(this.viewModalProps.due_date);

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

  getRemoveTaskFunction(taskId: number): () => void {
    return () => {
      this.taskToRemove = taskId;
      this.modal.open(this.MODAL_CONFIRM_ID + this.columnData.id);
    };
  }

  getShowModalFunction(taskId: number = 0): () => void {
    return () => { this.showModal(taskId); };
  }

  getShowViewModalFunction(taskId: number): () => void {
    return () => { this.showViewModal(taskId); };
  }

  showModal(taskId: number = 0) {
    if (taskId === 0) {
      this.modalProps = new Task();
      this.modalProps.column_id = this.columnData.id;

      this.modal.open(this.MODAL_ID + this.columnData.id);
      return;
    }

    const editTask = this.columnData.tasks.find(task => task.id === taskId);

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

  getUserName(userId: number) {
    const user = this.activeBoard.users
      .find((test: User) => test.id === +userId);

    return user.username;
  }

  callBoardUpdate() {
    this.onUpdateBoards.emit();
  }

  showViewModal(taskId: number) {
    const viewTask = this.columnData.tasks.find(task => task.id === taskId);

    this.updateTaskActivity(taskId);

    this.boardService
      .convertMarkdown(viewTask.description, this.markedCallback)
      .then(data => {
        data.html.replace(/(\{)([^}]+)(\})/g, '{{ "{" }}$2{{ "}"  }}');

        this.viewModalProps.html =
          this.sanitizer.bypassSecurityTrustHtml(data.html);
      });

    viewTask.comments.forEach(comment => {
      this.boardService.convertMarkdown(comment.text, this.markedCallback)
        .then(data => {
          comment.html = this.sanitizer.bypassSecurityTrustHtml(data.html);
        });
    });

    this.newComment = '';
    this.viewModalProps = Object.assign({}, viewTask);
    this.checkDueDate();

    if (this.showActivity) {
      this.showActivity = false;
      setTimeout(() => (this.showActivity = true), 500);
    }

    this.modal.open(this.MODAL_VIEW_ID + this.columnData.id);
  }

  preventEnter(event: any) {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
  }

  private uploadFile(attachment: Attachment, response: ApiResponse) {
      const data = new FormData();
      data.append('file', this.fileUpload);

      this.boardService.uploadAttachment(data, attachment.diskfilename)
        .subscribe(res => {
          res.alerts.forEach(note => this.notes.add(note));

          this.fileUploading = false;
          this.resetFileInput();

          if (res.status === 'success') {
            response.alerts.forEach(note => this.notes.add(note));

            this.viewModalProps.attachments.push(attachment);
            this.updateTaskActivity(this.viewModalProps.id);
          }
        });
  }

  private resetFileInput() {
    const upload = document.getElementsByClassName('fileuploadinput');

    Array.from(upload).forEach((input: any) => {
      input.value = '';
    })
  }

  private updateTaskActivity(id: number) {
    this.viewTaskActivities = [];

    if (this.activeUser.security_level > 2) {
      return;
    }

    this.boardService.getTaskActivity(id)
      .subscribe(response => {
        if (response.data.length === 0) {
          return;
        }

        response.data[1].forEach((item: any) => {
          this.viewTaskActivities.push(
            new ActivitySimple(item.text, item.timestamp));
        });
      });
  }

  private convertToTask(updatedTask: any) {
    const task = new Task(updatedTask.id,
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

    task.html = updatedTask.html;
    task.comments.forEach(comment => {
      this.boardService.convertMarkdown(comment.text, this.markedCallback)
        .then(data => { comment.html = data.html; });
    });

    return task;
  }

  private replaceUpdatedTask(updatedTask: any) {
    const oldTask = this.activeBoard.columns
      .find(column => +column.id === +updatedTask.column_id)
      .tasks.find(task => +task.id === +updatedTask.id);

    updatedTask.html = oldTask.html;

    this.updateTaskComments(oldTask, updatedTask.ownComment);
  }

  private updateTaskComments(task: Task, newComments: any[]) {
    task.comments = [];

    if (!newComments) {
      return;
    }

    newComments.forEach(comment => {
      task.comments.push(
        new Comment(comment.id, comment.text, comment.user_id,
                    comment.task_id, comment.timestamp)
      );
    });
  }

  // Needs anonymous function for proper `this` context.
  private markedCallback = (_: any, text: string) => {
    this.activeBoard.issue_trackers?.forEach(tracker => {
      const re = new RegExp(tracker.regex, 'ig');
      const replacements = new Array<any>();

      let result = re.exec(text);

      while (result !== null) {
        const link = '<a href="' + tracker.url.replace(/%BUGID%/g, result[1]) +
          '" target="tb_external" rel="noreferrer">' + result[0] + '</a>';

        replacements.push({ str: result[0], link });
        result = re.exec(text);
      }

      for (let i = replacements.length - 1; i >= 0; --i) {
        text = text.replace(replacements[i].str, replacements[i].link);
      }
    });

    return text;
  }

  private validateTask(task: Task) {
    if (task.title === '') {
      this.notes.add(
        new Notification('error', 'Task title is required.'));
      return false;
    }

    return true;
  }
}

