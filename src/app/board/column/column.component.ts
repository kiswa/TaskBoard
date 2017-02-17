import {
    Component,
    Input,
    ElementRef,
    OnInit
} from '@angular/core';

import {
    Column,
    Modal,
    Notification,
    // Task, // TODO: Create Task model
    ModalService,
    NotificationsService
} from '../../shared/index';

@Component({
    selector: 'tb-column',
    templateUrl: 'app/board/column/column.component.html'
})
export class ColumnDisplay implements OnInit {
    private templateElement: any;
    private tasks: Array<any>; // TODO: Use Task model
    private collapseTasks: boolean;
    private modalProps: any; // TODO: Create ModalProperties model

    private MODAL_ID: string;
    private MODAL_CONFIRM_ID: string;

    @Input('column') columnData: Column;
    @Input('sideBySide') sideBySide: boolean;

    constructor(private elRef: ElementRef,
                private notes: NotificationsService,
                private modal: ModalService) {
        this.MODAL_ID = 'task-addEdit-form';
        this.MODAL_CONFIRM_ID = 'task-remove-confirm';

        this.templateElement = elRef.nativeElement;
        this.tasks = [];
        this.collapseTasks = false;
        this.modalProps = { title: '' }; // TODO: Use model
    }

    ngOnInit() {
        this.templateElement.classList.remove('double');

        if (this.sideBySide) {
            this.templateElement.classList.add('double');
        }
    }

    toggleCollapsed() {
        this.templateElement.classList.toggle('collapsed');
    }

    toggleTaskCollapse() {
        this.collapseTasks = !this.collapseTasks;
    }

    addEditTask() {
        // TODO
    }

    private showModal(title: string, task?: any): void { // TODO: Use Task model
        let isAdd = (title === 'Add');

        this.modalProps = {
            title,
            prefix: isAdd ? '' : 'Edit',
            task: isAdd ? task /*new Task()*/ : task
        };

        this.modal.open(this.MODAL_ID);
    }
}

