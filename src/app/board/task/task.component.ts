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

    @Input('task') taskData: Task;
    @Input('add-task') addTask: Function;
    @Input('remove-task') removeTask: Function;

    constructor(private auth: AuthService,
                private sanitizer: DomSanitizer,
                private boardService: BoardService,
                private modal: ModalService,
                private notes: NotificationsService) {
        auth.userChanged.subscribe(() => {
            this.userOptions = auth.userOptions;
        });

        boardService.activeBoardChanged.subscribe((board: Board) => {
            let menuText = 'Move to Column: <select>';

            board.columns.forEach((column: Column) => {
                menuText += '<option>' + column.name + '</option>';
            });

            menuText += '</select>';

            this.selectMenuItem = new ContextMenuItem(menuText, null, false, false);
        });

        this.initMarked();
    }

    ngOnInit() {
        this.contextMenuItems = [
            new ContextMenuItem('View Task'),
            new ContextMenuItem('Edit Task'),
            new ContextMenuItem('Remove Task', this.removeTask),
            new ContextMenuItem('', null, true),
            new ContextMenuItem('Copy To Board'),
            new ContextMenuItem('Move To Board'),
            new ContextMenuItem('', null, true),
            this.selectMenuItem,
            new ContextMenuItem('', null, true),
            new ContextMenuItem('Add Task', this.addTask)
        ];
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

    private initMarked() {
        let renderer = new marked.Renderer();

        renderer.listitem = text => {
            if (/^\s*\[[x ]\]\s*/.test(text)) {
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

