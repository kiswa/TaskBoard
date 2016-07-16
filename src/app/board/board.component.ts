import { Component } from '@angular/core';

import { TopNav } from '../shared/index';

@Component({
    selector: 'tb-board',
    templateUrl: 'app/board/board.component.html',
    directives: [ TopNav ]
})
export class Board {
}

