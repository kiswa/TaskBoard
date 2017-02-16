import {
    Component,
    Input,
    ElementRef
} from '@angular/core';

import { Column } from '../../shared/index';

@Component({
    selector: 'tb-column',
    templateUrl: 'app/board/column/column.component.html'
})
export class ColumnDisplay {
    private templateElement: any;
    private taskCount: number;

    @Input('column') column: Column;

    constructor(private elRef: ElementRef) {
        this.templateElement = elRef.nativeElement;
        this.taskCount = 0;
    }

    toggleCollapsed() {
        this.templateElement.classList.toggle('collapsed');
    }

}

