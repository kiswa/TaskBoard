import { Component } from '@angular/core';

import { TopNav } from '../top-nav/top-nav.component';

@Component({
    selector: 'tb-board',
    templateUrl: 'app/board/board.component.html',
    directives: [ TopNav ]
})
export class Board {
}

