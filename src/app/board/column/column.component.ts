import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';

import {
    ApiResponse,
    Board,
    Category,
    Column,
    ContextMenu,
    ContextMenuItem,
    Modal,
    Notification,
    Task,
    User,
    UserOptions,
    AuthService,
    ModalService,
    NotificationsService,
    StringsService
} from '../../shared/index';
import { BoardService } from '../board.service';

@Component({
    selector: 'tb-column',
    templateUrl: 'app/board/column/column.component.html'
})
export class ColumnDisplay implements OnInit {
    private strings: any;
    private templateElement: any;
    private collapseTasks: boolean;
    private saving: boolean;
    private showLimitEditor: boolean;

    private activeUser: User;
    private activeBoard: Board;
    private userOptions: UserOptions;
    private tasks: Array<Task>;

    private contextMenuItems: Array<ContextMenuItem>;
    private sortOption: string;

    private MODAL_ID: string;
    private MODAL_CONFIRM_ID: string;

    private quickAdd: Task;
    private modalProps: Task;
    private taskToRemove: number;
    private taskLimit: number;

    @Input('column') columnData: Column;
    @Input('boards') boards: Array<Board>;

    @Output('on-update-boards') onUpdateBoards: EventEmitter<any> = new EventEmitter<any>();

    constructor(private elRef: ElementRef,
                private auth: AuthService,
                private notes: NotificationsService,
                private modal: ModalService,
                private stringsService: StringsService,
                private boardService: BoardService) {
        this.templateElement = elRef.nativeElement;
        this.tasks = [];
        this.collapseTasks = false;
        this.sortOption = 'pos';

        this.MODAL_ID = 'add-task-form-';
        this.MODAL_CONFIRM_ID = 'task-remove-confirm';

        this.quickAdd = new Task();
        this.modalProps = new Task();

        stringsService.stringsChanged.subscribe(newStrings => {
            this.strings = newStrings;

            this.contextMenuItems = [
                new ContextMenuItem(this.strings.boards_addTask,
                                    this.getShowModalFunction())
            ];
        });

        boardService.activeBoardChanged.subscribe((board: Board) => {
            this.activeBoard = board;
        });

        auth.userChanged.subscribe((user: User) => {
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
        });
    }

    ngOnInit() {
        this.templateElement.classList.remove('double');

        if (this.userOptions.multiple_tasks_per_row) {
            this.templateElement.classList.add('double');
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

                this.modal.close(this.MODAL_ID + this.columnData.id);

                if (response.status !== 'success') {
                    return;
                }

                let boardData = response.data[2][0];

                boardData.ownColumn.forEach((column: any) => {
                    if (!column.ownTask) {
                        column.ownTask = [];
                    }
                });

                this.boardService.updateActiveBoard(boardData);
                this.boardService.refreshToken();
            });
    }

    updateTask() {
        this.boardService.updateTask(this.modalProps)
            .subscribe((response: ApiResponse) => {
                response.alerts.forEach(note => this.notes.add(note));

                if (response.status !== 'success') {
                    return;
                }

                this.boardService.updateActiveBoard(response.data[2][0]);
                this.modal.close(this.MODAL_ID + this.columnData.id);

                this.boardService.refreshToken();
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

    private getRemoveTaskFunction(taskId: number): Function {
        return () => {
            this.taskToRemove = taskId;
            this.modal.open(this.MODAL_CONFIRM_ID + this.columnData.id);
        };
    }

    private getShowModalFunction(taskId: number = 0): Function {
        return () => { this.showModal(taskId); };
    }

    private quickAddClicked(event: any) {
        this.preventEnter(event);

        if (this.quickAdd.title === '') {
            this.showModal();
            return;
        }

        this.quickAdd.column_id = this.columnData.id;
        this.addTask(this.quickAdd);

        this.quickAdd = new Task();
    }

    private showModal(taskId: number = 0) {
        if (taskId === 0) {
            this.modalProps = new Task();
            this.modalProps.column_id = this.columnData.id;

            this.modal.open(this.MODAL_ID + this.columnData.id);
            return;
        }

        let editTask = this.columnData.tasks
            .filter(task => task.id === taskId)[0];

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

