import {
    Component,
    Input,
    OnInit
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import * as marked from 'marked';
import * as hljs from 'highlight.js';

import {
    ApiResponse,
    Board,
    Column,
    ContextMenu,
    ContextMenuItem,
    Notification,
    Task,
    UserOptions,
    AuthService,
    ModalService,
    NotificationsService
} from '../../shared/index';
import { BoardService } from '../board.service';

@Component({
    selector: 'tb-task',
    templateUrl: 'app/board/task/task.component.html'
})
export class TaskDisplay implements OnInit {
    private userOptions: UserOptions;
    private contextMenuItems: Array<ContextMenuItem>;
    private selectMenuItem: ContextMenuItem;

    private activeBoard: Board;
    private boardsList: Array<Board>;

    private totalTasks: number;
    private completeTasks: number;
    private percentComplete: number;

    @Input('task') taskData: Task;
    @Input('add-task') addTask: Function;
    @Input('edit-task') editTask: Function;
    @Input('remove-task') removeTask: Function;
    @Input('collapse') isCollapsed: boolean;

    @Input('boards')
    set boards(boards: Array<Board>) {
        this.boardsList = boards;
        this.generateContextMenuItems();
    }

    constructor(private auth: AuthService,
                private sanitizer: DomSanitizer,
                private boardService: BoardService,
                private modal: ModalService,
                private notes: NotificationsService) {
        this.totalTasks = 0;
        this.completeTasks = 0;
        this.percentComplete = 0;
        this.contextMenuItems = [];

        auth.userChanged.subscribe(() => {
            this.userOptions = auth.userOptions;
        });

        boardService.activeBoardChanged.subscribe((board: Board) => {
            this.activeBoard = board;
        });
    }

    ngOnInit() {
        // Since marked is global, the counts need to be stored uniquely per task.
        // String literal access needed because augmenting the type doesn't work.
        marked['taskCounts'] = []; // tslint:disable-line
        marked['taskCounts'][this.taskData.id] = { // tslint:disable-line
            total: 0,
            complete: 0
        };

        this.generateContextMenuItems();
        this.initMarked();
        this.calcPercentComplete();
    }

    getTaskDescription(): SafeHtml {
        let html = this.sanitizer.bypassSecurityTrustHtml(
            marked(this.taskData.description));

        return html;
    }

    getPercentStyle() {
        return this.sanitizer.bypassSecurityTrustStyle(
            'padding: 0; height: 5px; background-color: rgba(0, 0, 0, .4); ' +
            'width: ' + (this.percentComplete * 100) + '%;');
    }

    getPercentTitle() {
        return 'Task ' + (this.percentComplete * 100) + '% Complete';
    }

    // Expects a color in full HEX with leading #, e.g. #ffffe0
    getTextColor(color: string): string {
        let r = parseInt(color.substr(1, 2), 16),
            g = parseInt(color.substr(3, 2), 16),
            b = parseInt(color.substr(5, 2), 16),
            yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        return yiq >= 140 ? '#333333' : '#efefef';
    }

    private getMoveMenuItem() {
        let menuText = 'Move to Column: <select id="columnsList' + this.taskData.id + '">';

        this.activeBoard.columns.forEach((column: Column) => {
            menuText += '<option value="' + column.id + '">' + column.name + '</option>';
        });

        menuText += '</select>';

        return new ContextMenuItem(menuText,
                                   () => { this.changeTaskColumn(); },
                                   false, false);
    }

    private changeTaskColumn() {
        let select = document.getElementById('columnsList' + this.taskData.id) as HTMLSelectElement;

        this.taskData.column_id = +select[select.selectedIndex].value;

        this.boardService.updateTask(this.taskData)
            .subscribe((response: ApiResponse) => {
                response.alerts.forEach(note => this.notes.add(note));

                if (response.status !== 'success') {
                    return;
                }

                this.boardService.updateActiveBoard(response.data[2][0]);
            });
    }

    private calcPercentComplete() {
        this.percentComplete = 0;

        // String literal access needed because augmenting the type doesn't work.
        marked['taskCounts'][this.taskData.id] = { // tslint:disable-line
            total: 0,
            complete: 0
        };

        marked(this.taskData.description);

        if (marked['taskCounts'][this.taskData.id].total) { // tslint:disable-line
            this.percentComplete = marked['taskCounts'][this.taskData.id].complete / // tslint:disable-line
                                   marked['taskCounts'][this.taskData.id].total; // tslint:disable-line
        }
    }

    private generateContextMenuItems() {
        this.contextMenuItems = [
            new ContextMenuItem('View Task'),
            new ContextMenuItem('Edit Task', this.editTask),
            new ContextMenuItem('Remove Task', this.removeTask),
            new ContextMenuItem('', null, true),
            this.getMoveMenuItem(),
            new ContextMenuItem('', null, true),
            new ContextMenuItem('Add Task', this.addTask)
        ];

        if (this.boardsList.length > 1) {
            this.contextMenuItems
                .splice(3, 0,
                        new ContextMenuItem('', null, true),
                        this.getMenuItem('Copy'),
                        this.getMenuItem('Move'));
        }
    }

    private getMenuItem(text: string): ContextMenuItem {
        let menuText = text + ' to Board: ' +
            '<i class="icon icon-help-circled" ' +
                'data-help="The task will be placed in the first ' +
                'column of the selected board."></i> ' +
            '<select id="boardsList' + text + '">';

        this.boardsList.forEach((board: Board) => {
            if (board.name !== this.activeBoard.name) {
                menuText += '<option value="' + board.id + '">' + board.name + '</option>';
            }
        });

        menuText += '</select>';

        return new ContextMenuItem(menuText, null, false, false);
    }

    private initMarked() {
        let renderer = new marked.Renderer();

        // String literal access needed because augmenting the type doesn't work.
        renderer.listitem = text => {
            if (/^\s*\[[x ]\]\s*/.test(text)) {
                marked['taskCounts'][this.taskData.id].total += 1; // tslint:disable-line

                if (/^\s*\[x\]\s*/.test(text)) {
                    marked['taskCounts'][this.taskData.id].complete += 1; // tslint:disable-line
                }

                text = text
                    .replace(/^\s*\[ \]\s*/,
                             '<i class="icon icon-check-empty"></i> ')
                    .replace(/^\s*\[x\]\s*/,
                             '<i class="icon icon-check"></i> ');
                return '<li class="checklist">' + text + '</li>';
            } else {
                return '<li>' + text + '</li>';
            }
        };

        renderer.link = (href, title, text) => {
            let out = '<a href="' + href + '"';

            if (title) {
                out += ' title="' + title + '"';
            }

            out += ' target="tb_external">' + text + '</a>';

            return out;
        };

        marked.setOptions({
            renderer,
            smartypants: true,
            highlight: code => {
                return hljs.highlightAuto(code).value;
            }
        });
    }
}

