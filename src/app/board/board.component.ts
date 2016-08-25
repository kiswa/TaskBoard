import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TopNav } from '../shared/index';

@Component({
    selector: 'tb-board',
    templateUrl: 'app/board/board.component.html',
    directives: [ TopNav ]
})
export class Board {
    constructor(private title: Title) {
        title.setTitle('TaskBoard - Kanban App');
    }
}

