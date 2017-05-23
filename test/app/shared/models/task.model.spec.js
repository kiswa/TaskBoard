/* global expect */
var path = '../../../../build/shared/models/',
    Task = require(path + 'task.model.js').Task;

describe('Task', () => {
    var task;

    beforeEach(() => {
        task = new Task(1, 'title', 'desc', 'color', 'today', 3, 1, 1,
                        [{ id: 1, text: '', user_id: 1, task_id: 1 }],
                        [{
                            id: 1, filename: '', name: '', type: '',
                            user_id: 1, timestamp: '', task_id: 1
                        }],
                        [{
                            default_board_id: 0, email: '', id: 1,
                            last_login: null, security_level: 1,
                            user_option_id: 1, username: '',
                            board_access: [], collapsed: []
                        }],
                        [{ id: 1, name: '', default_task_color: '', board_id: 1 }]);
    });

    it('has sane defaults', () => {
        task = new Task();

        expect(task.id).to.equal(0);
        expect(task.title).to.equal('');
        expect(task.description).to.equal('');
        expect(task.color).to.equal('#ffffe0');
        expect(task.due_date).to.equal('');
        expect(task.points).to.equal(0);
        expect(task.position).to.equal(0);
        expect(task.column_id).to.equal(0);
        expect(task.comments.length).to.equal(0);
        expect(task.attachments.length).to.equal(0);
        expect(task.assignees.length).to.equal(0);
        expect(task.categories.length).to.equal(0);
    });

    it('has an id', () => {
        expect(task.id).to.be.a('number');
        expect(task.id).to.equal(1);
    });

    it('has a title', () => {
        expect(task.title).to.be.a('string');
        expect(task.title).to.equal('title');
    });

    it('has a description', () => {
        expect(task.description).to.be.a('string');
        expect(task.description).to.equal('desc');
    });

    it('has a color', () => {
        expect(task.color).to.be.a('string');
        expect(task.color).to.equal('color');
    });

    it('has a due_date', () => {
        expect(task.due_date).to.be.a('string');
        expect(task.due_date).to.equal('today');
    });

    it('has points', () => {
        expect(task.points).to.be.a('number');
        expect(task.points).to.equal(3);
    });

    it('has a position', () => {
        expect(task.position).to.be.a('number');
        expect(task.position).to.equal(1);
    });

    it('has a column_id', () => {
        expect(task.column_id).to.be.a('number');
        expect(task.column_id).to.equal(1);
    });

    it('has comments', () => {
        expect(task.comments).to.be.an('array');
        expect(task.comments.length).to.equal(1);
    });

    it('has attachments', () => {
        expect(task.attachments).to.be.an('array');
        expect(task.attachments.length).to.equal(1);
    });

    it('has assignees', () => {
        expect(task.assignees).to.be.an('array');
        expect(task.assignees.length).to.equal(1);
    });

    it('has categories', () => {
        expect(task.categories).to.be.an('array');
        expect(task.categories.length).to.equal(1);
    });
});

