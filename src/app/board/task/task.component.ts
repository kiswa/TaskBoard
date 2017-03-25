import { Component, Input } from '@angular/core';

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

    constructor(auth: AuthService) {
        auth.userChanged.subscribe(() => {
            this.userOptions = auth.userOptions;
        });
    }

    // Expects a color in full HEX with leading #, e.g. #ffffe0
    getTextColor(color: string): string {
        let r = parseInt(color.substr(1, 2), 16),
            g = parseInt(color.substr(3, 2), 16),
            b = parseInt(color.substr(5, 2), 16),
            yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        return yiq >= 130 ? '#333333' : '#efefef';
    }
}

