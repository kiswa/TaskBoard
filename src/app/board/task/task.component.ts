import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
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
    NotificationsService,
    StringsService
} from '../../shared/index';
import { BoardService } from '../board.service';

@Component({
    selector: 'tb-task',
    templateUrl: 'app/board/task/task.component.html'
})
export class TaskDisplay implements OnInit {
    private strings: any;
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

    @Output('on-update-boards') onUpdateBoards: EventEmitter<any>;

    @Input('boards')
    set boards(boards: Array<Board>) {
        this.boardsList = boards;
        this.generateContextMenuItems();
    }

    constructor(private auth: AuthService,
                private sanitizer: DomSanitizer,
                private boardService: BoardService,
                private modal: ModalService,
                private notes: NotificationsService,
                private stringsService: StringsService) {
        this.onUpdateBoards = new EventEmitter<any>();
        this.totalTasks = 0;
        this.completeTasks = 0;
        this.percentComplete = 0;
        this.contextMenuItems = [];

        stringsService.stringsChanged.subscribe(newStrings => {
            this.strings = newStrings;

            if (this.taskData) {
                this.generateContextMenuItems();
            }
        });

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
            marked(this.taskData.description, this.markedCallback));

        return html;
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

                // text = text.replace(result[0], link);
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

    private getMoveMenuItem() {
        let menuText = this.strings.boards_moveTask +
            ': <select id="columnsList' + this.taskData.id + '">';

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

                if (response.status === 'success') {
                    this.boardService.updateActiveBoard(response.data[2][0]);
                }
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
            new ContextMenuItem(this.strings.boards_viewTask),
            new ContextMenuItem(this.strings.boards_editTask, this.editTask),
            new ContextMenuItem(this.strings.boards_removeTask, this.removeTask),
            new ContextMenuItem('', null, true),
            this.getMoveMenuItem(),
            new ContextMenuItem('', null, true),
            new ContextMenuItem(this.strings.boards_addTask, this.addTask)
        ];

        if (this.boardsList && this.boardsList.length > 1) {
            this.contextMenuItems
                .splice(3, 0,
                        new ContextMenuItem('', null, true),
                        this.getMenuItem(this.strings.boards_copyTaskTo),
                        this.getMenuItem(this.strings.boards_moveTaskTo));
        }
    }

    private getMenuItem(text: string): ContextMenuItem {
        let menuText = text + ': ' +
            '<i class="icon icon-help-circled" ' +
                'data-help="' + this.strings.boards_copyMoveHelp + '"></i> ' +
            '<select id="boardsList' + text.split(' ')[0] + '">';

        this.boardsList.forEach((board: Board) => {
            if (board.name !== this.activeBoard.name) {
                menuText += '<option value="' + board.id + '">' + board.name + '</option>';
            }
        });

        menuText += '</select>';

        let action = () => {
            if (text === this.strings.boards_copyTaskTo) {
                this.copyTaskToBoard();
                return;
            }

            this.moveTaskToBoard();
        };

        return new ContextMenuItem(menuText, action, false, false);
    }

    private copyTaskToBoard() {
        let select = document.getElementById('boardsList' +
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

    private moveTaskToBoard() {
        let select = document.getElementById('boardsList' +
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

            out += ' target="tb_external" rel="noreferrer">' + text + '</a>';

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

