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
        this.contextMenuItems = [];

        auth.userChanged.subscribe(() => {
            this.userOptions = auth.userOptions;
        });

        boardService.activeBoardChanged.subscribe((board: Board) => {
            this.activeBoard = board;

            let menuText = 'Move to Column: <select>';

            board.columns.forEach((column: Column) => {
                menuText += '<option value="column.id">' + column.name + '</option>';
            });

            menuText += '</select>';

            this.selectMenuItem = new ContextMenuItem(menuText, null, false, false);
        });

        this.initMarked();
    }

    ngOnInit() {
        this.generateContextMenuItems();

        this.totalTasks = 0;
        this.completeTasks = 0;

        // Updates the counts above
        this.getTaskDescription();

        this.percentComplete = this.completeTasks / this.totalTasks;
    }

    getTaskDescription(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(
            marked(this.taskData.description));
    }

    // Expects a color in full HEX with leading #, e.g. #ffffe0
    getTextColor(color: string): string {
        let r = parseInt(color.substr(1, 2), 16),
            g = parseInt(color.substr(3, 2), 16),
            b = parseInt(color.substr(5, 2), 16),
            yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        return yiq >= 140 ? '#333333' : '#efefef';
    }

    private getPercentStyle() {
        return this.sanitizer.bypassSecurityTrustStyle(
            'padding: 0; height: 5px; background-color: rgba(0, 0, 0, .4); ' +
            'width: ' + (this.percentComplete * 100) + '%;');
    }

    private generateContextMenuItems() {
        this.contextMenuItems = [
            new ContextMenuItem('View Task'),
            new ContextMenuItem('Edit Task', this.editTask),
            new ContextMenuItem('Remove Task', this.removeTask),
            new ContextMenuItem('', null, true),
            this.selectMenuItem,
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
        let menuText = text + ' to Board: <select>';

        this.boardsList.forEach((board: Board) => {
            if (board.name !== this.activeBoard.name) {
                menuText += '<option value="board.id">' + board.name + '</option>';
            }
        });

        menuText += '</select>';

        return new ContextMenuItem(menuText, null, false, false);
    }

    private initMarked() {
        let renderer = new marked.Renderer();

        renderer.listitem = text => {
            if (/^\s*\[[x ]\]\s*/.test(text)) {
                this.totalTasks += 1;

                if (/^\s*\[x\]\s*/.test(text)) {
                    this.completeTasks += 1;
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

