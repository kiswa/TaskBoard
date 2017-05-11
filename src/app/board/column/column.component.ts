import {
    Component,
    Input,
    ElementRef,
    OnInit
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
    private templateElement: any;
    private collapseTasks: boolean;

    private activeUser: User;
    private activeBoard: Board;
    private userOptions: UserOptions;
    private tasks: Array<Task>;

    private contextMenuItems: Array<ContextMenuItem>;

    private MODAL_ID: string;
    private MODAL_CONFIRM_ID: string;

    private modalProps: Task;
    private taskToRemove: number;

    @Input('column') columnData: Column;
    @Input('boards') boards: Array<Board>;

    constructor(private elRef: ElementRef,
                private auth: AuthService,
                private notes: NotificationsService,
                private modal: ModalService,
                private stringsService: StringsService,
                private boardService: BoardService) {
        this.templateElement = elRef.nativeElement;
        this.tasks = [];
        this.collapseTasks = false;

        this.contextMenuItems = [
            new ContextMenuItem('Add Task',
                                this.getShowModalFunction())
        ];

        this.MODAL_ID = 'add-task-form-';
        this.MODAL_CONFIRM_ID = 'task-remove-confirm';

        this.modalProps = new Task();

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

    addTask() {
        this.boardService.addTask(this.modalProps)
            .subscribe((response: ApiResponse) => {
                response.alerts.forEach(note => this.notes.add(note));

                this.modal.close(this.MODAL_ID + this.columnData.id);

                let boardData = response.data[2][0];

                boardData.ownColumn.forEach((column: any) => {
                    if (!column.ownTask) {
                        column.ownTask = [];
                    }
                });

                let newBoard = this.convertBoardData(boardData);
                this.boardService.updateActiveBoard(newBoard);
            });
    }

    removeTask() {
        this.boardService.removeTask(this.taskToRemove)
            .subscribe((response: ApiResponse) => {
                response.alerts.forEach(note => this.notes.add(note));

                if (response.status !== 'success') {
                    return;
                }

                let newBoard = this.convertBoardData(response.data[1][0]);
                this.boardService.updateActiveBoard(newBoard);
            });
    }

    private convertBoardData(boardData: any): Board {
        return new Board(+boardData.id, boardData.name,
                         boardData.is_active === '1',
                         boardData.ownColumn,
                         boardData.ownCategory,
                         boardData.ownAutoAction,
                         boardData.ownIssuetracker,
                         boardData.sharedUser);
    }

    private getRemoveTaskFunction(taskId: number): Function {
        return () => {
            this.taskToRemove = taskId;
            this.modal.open(this.MODAL_CONFIRM_ID + this.columnData.id);
        };
    }

    private getShowModalFunction(): Function {
        return () => { this.showModal(); };
    }

    private showModal() {
        this.modalProps = new Task();
        this.modalProps.column_id = this.columnData.id;
        this.modalProps.color = '#ffffe0';

        this.modal.open(this.MODAL_ID + this.columnData.id);
    }

    private preventEnter(event: any) {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
    }
}

