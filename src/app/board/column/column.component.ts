import {
    Component,
    Input,
    ElementRef,
    OnInit
} from '@angular/core';

import {
    ApiResponse,
    Board,
    Column,
    Modal,
    Notification,
    Task,
    User,
    UserOptions,
    AuthService,
    NotificationsService
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
    private modalProps: Task;

    @Input('column') columnData: Column;
    @Input('add-task-modal-id') addModalId: string;
    @Input('remove-task-modal-id') removeModalId: string;

    constructor(private elRef: ElementRef,
                private auth: AuthService,
                private notes: NotificationsService,
                private modal: ModalService,
                private boardService: BoardService) {
        this.templateElement = elRef.nativeElement;
        this.tasks = [];
        this.collapseTasks = false;
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

    addEditTask() {
        // TODO
    }

    private showModal(): void {
        this.modalProps = new Task();
        this.modalProps.column_id = +this.columnData.id;

        this.modal.open(this.MODAL_ID);
    }
}

