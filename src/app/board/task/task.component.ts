import {
    Component,
    Input,
    OnInit
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import * as Marked from 'marked';
import * as hljs from 'highlight.js';

import {
    ContextMenu,
    ContextMenuItem,
    Task,
    UserOptions,
    AuthService
} from '../../shared/index';

@Component({
    selector: 'tb-task',
    templateUrl: 'app/board/task/task.component.html'
})
export class TaskDisplay implements OnInit {
    private userOptions: UserOptions;
    private contextMenuItems: Array<ContextMenuItem>;

    @Input('task') taskData: Task;
    @Input('add-task') addTask: Function;

    constructor(private auth: AuthService,
                private sanitizer: DomSanitizer) {
        auth.userChanged.subscribe(() => {
            this.userOptions = auth.userOptions;
        });

        this.initMarked();
    }

    ngOnInit() {
        this.contextMenuItems = [
            new ContextMenuItem('View Task'),
            new ContextMenuItem('Edit Task'),
            new ContextMenuItem('Delete Task'),
            new ContextMenuItem('', null, true),
            new ContextMenuItem('Move to Column:', null, false, false),
            new ContextMenuItem('', null, true),
            new ContextMenuItem('Add New Task', this.addTask)
        ];
    }

    getTaskDescription(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(
            Marked(this.taskData.description));
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
        let renderer = new Marked.Renderer();

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

        Marked.setOptions({
            renderer,
            smartypants: true,
            highlight: code => {
                return hljs.highlightAuto(code).value;
            }
        });
    }
}

