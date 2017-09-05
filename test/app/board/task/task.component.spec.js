/* global expect AuthServiceMock SanitizerMock NotificationsServiceMock
          BoardServiceMock ModalServiceMock StringsServiceMock */
var path = '../../../../build/board/task/',
    TaskDisplay = require(path + 'task.component.js').TaskDisplay;

describe('TaskDisplay', () => {
    var task,
        modalService;

    beforeEach(() => {
        modalService = new ModalServiceMock();

        task = new TaskDisplay(AuthServiceMock, SanitizerMock,
                               BoardServiceMock, modalService,
                               new NotificationsServiceMock(),
                               StringsServiceMock);
    });

    it('implements ngOnInit', () => {
        task.taskData = { id: 1, description: '' };
        task.ngOnInit();
    });

    it('has a function to get the task description', () => {
        task.taskData = { description: 'test' };
        task.activeBoard = { issue_trackers: [
            {
                regex: '(?:Issue)?#(\d+)',
                url: 'https://github.com/kiswa/TaskBoard/issues/%BUGID%'
            }]
        };

        var text = task.getTaskDescription();

        expect(text.trim()).to.equal('<p>test</p>');
    });

    it('has a function to get styles for percent completion', () => {
        task.percentComplete = .5;

        var css = task.getPercentStyle();

        expect(css).to.equal('padding: 0; height: 5px; ' +
            'background-color: rgba(0, 0, 0, .4); width: 50%;');
    });

    it('has a function to get a title for percent completion', () => {
        task.percentComplete = .5;
        task.strings = { boards_task: 'Task', boards_taskComplete: 'complete' };

        var title = task.getPercentTitle();

        expect(title).to.equal('Task 50% complete');
    });

    it('has a function to get text color', () => {
        var color = task.getTextColor('#ffffff');

        expect(color).to.equal('#333333');
    });

    it('has a function to check the due date', () => {
        task.isOverdue = false;
        task.isNearlyDue = false;

        task.taskData = { due_date: '' };
        task.checkDueDate();

        expect(task.isOverdue).to.equal(false);
        expect(task.isNearlyDue).to.equal(false);

        var date =new Date(),
            tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000),
            yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);

        task.taskData = { due_date: tomorrow };
        task.checkDueDate();

        expect(task.isOverdue).to.equal(false);
        expect(task.isNearlyDue).to.equal(true);

        task.taskData = { due_date: yesterday };
        task.checkDueDate();

        expect(task.isOverdue).to.equal(true);
    });

    it('has a function to change task column', () => {
        task.taskData = { id: 1 };

        document.getElementById = () => {
            return { selectedIndex: 0, 0: { value: 1 } };
        };

        task.changeTaskColumn();
    });

    it("has a function to copy a task to another board", () => {
        task.taskData = { id: 1 };
        task.strings = { boards_copyTaskTo: 'two words' };

        document.getElementById = () => {
            return { selectedIndex: 0, 0: { value: 1 } };
        };

        task.boardsList = [{ id: 1, columns: [{ id: 1 }] }];

        task.copyTaskToBoard();
    });

    it('has a function to move a task to another board', () => {
        task.taskData = { id: 1 };
        task.strings = { boards_moveTaskTo: 'two words' };

        document.getElementById = () => {
            return { selectedIndex: 0, 0: { value: 1 } };
        };

        task.boardsList = [{ id: 1, columns: [{ id: 1 }] }];

        task.moveTaskToBoard();
    });
});


