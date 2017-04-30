import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import * as Marked from 'marked';
import * as hljs from 'highlight.js';

import {
    Task,
    UserOptions,
    AuthService
} from '../../shared/index';

@Component({
    selector: 'tb-task',
    templateUrl: 'app/board/task/task.component.html'
})
export class TaskDisplay {
    private userOptions: UserOptions;

    @Input('task') taskData: Task;

    constructor(private auth: AuthService,
                private sanitizer: DomSanitizer) {
        auth.userChanged.subscribe(() => {
            this.userOptions = auth.userOptions;
        });

        this.initMarked();
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
                             '<i class="icon icon-check-empty" style="margin-right:-4px"></i> ')
                    .replace(/^\s*\[x\]\s*/,
                             '<i class="icon icon-check" style="margin-right:-4px"></i> ');
                return '<li style="list-style: none; margin-left: -27px;">' + text + '</li>';
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

