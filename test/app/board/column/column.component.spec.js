/* global expect ElementRefMock AuthServiceMock NotificationsServiceMock StringsServiceMock BoardServiceMock ModalServiceMock */
var path = '../../../../build/board/column/',
    ColumnDisplay = require(path + 'column.component.js').ColumnDisplay;

describe('ColumnDisplay', () => {
    var column,
        modalService;

    beforeEach(() => {
        modalService = new ModalServiceMock();

        column = new ColumnDisplay(ElementRefMock, AuthServiceMock,
                                   new NotificationsServiceMock(),
                                   modalService, StringsServiceMock,
                                   BoardServiceMock);
    });

    it('implements ngOnInit', () => {
        column.columnData = { task_limit: 3, id: 1, tasks: [] };
        column.activeUser = { collapsed: [1] };
        column.userOptions = { multiple_tasks_per_row: true };

        column.ngOnInit();

        expect(column.taskLimit).to.equal(3);
    });

    it('has a function to sort tasks', () => {
        column.columnData = {
            tasks: [{
                position: 1,
                due_date: '1/1/2017',
                points: 5
            }, {
                position: 2,
                due_date: '1/1/2016',
                points: 8
            }, {
                position: 3,
                due_date: '1/1/2018',
                points: 13
            }]
        };
        column.sortOption = 'pos';
        column.sortTasks();

        expect(column.columnData.tasks[0].position).to.equal(1);

        column.sortOption = 'due';
        column.sortTasks();

        expect(column.columnData.tasks[0].due_date).to.equal('1/1/2016');

        column.sortOption = 'pnt';
        column.sortTasks();

        expect(column.columnData.tasks[0].points).to.equal(13);
    });

    it('has a function to toggle collapsed state', () => {
        column.activeUser = { id: 1 };
        column.columnData = { id: 1 };
        column.toggleCollapsed();

        expect(column.activeUser.collapsed[0]).to.equal(1);
    });

    it('has a function to toggle task collapsed state', () => {
        column.collapseTasks = false;
        column.toggleTaskCollapse();

        expect(column.collapseTasks).to.equal(true);
    });

    it('has a function to update task color by category', () => {
        column.modalProps = {};
        column.updateTaskColorByCategory([{ default_task_color: 'test' }]);

        expect(column.modalProps.color).to.equal('test');
    });

    it('has a function to validate a task', () => {
        var test = column.validateTask({ title: '' });
        expect(test).to.equal(false);

        test = column.validateTask({ title: 'test' });
        expect(test).to.equal(true);
    });

    it('has a functions to add, update, and remove a task', () => {
        column.columnData = { id: 1 };
        column.modalProps = { title: 'test' };

        column.addTask();
        column.updateTask();
        column.removeTask();
    });

    it('has a function to load a column task limit editor', () => {
        column.columnData = { task_limit: 3 };
        column.beginLimitEdit();

        expect(column.taskLimit).to.equal(3);
        expect(column.showLimitEditor).to.equal(true);
    });

    it('has a function to close the task limit editor', () => {
        column.showLimitEditor = true;
        column.cancelLimitChanges();

        expect(column.showLimitEditor).to.equal(false);
    });

    it('has a function to save task limit changes', () => {
        column.columnData = { task_limit: 1 };
        column.taskLimit = 3;

        column.saveLimitChanges();

        expect(column.columnData.task_limit).to.equal(3);
        expect(column.showLimitEditor).to.equal(false);
    });

    it('has a function to update boards for child components', done => {
        column.onUpdateBoards = {
            emit: () => { done(); }
        };

        column.callBoardUpdate();
    });

    it('has a function to get a remove task function', () => {
        var func = column.getRemoveTaskFunction(1);
        column.columnData = { id: 1 };

        expect(func).to.be.a('function');
        func();

        expect(column.taskToRemove).to.equal(1);
    });

    it('has a function to get a show modal function', () => {
        var func = column.getShowModalFunction();
        column.columnData = { id: 1 };

        expect(func).to.be.a('function');
        func();
    });

    it('has a function to handle quick add', () => {
        column.columnData = { id: 1 };
        column.quickAddClicked({ stopPropagation: () => {} });

        column.quickAdd = { title: 'test' };
        column.quickAddClicked({ stopPropagation: () => {} });
    });

    it('has a function to show modals', () => {
        column.columnData = {
            tasks: [{
                id: 1, title: 'test', description: '', color: 'red',
                due_date: '', points: 3, position: 1, column_id: 1,
                comments: [], attachments: [], assignees: [{ id: 1 }],
                categories: [{ id: 1 }]
            }]
        };
        column.activeBoard = { users: [{ id: 1 }], categories: [{ id: 1 }] };

        column.showModal(1);
    });
});

