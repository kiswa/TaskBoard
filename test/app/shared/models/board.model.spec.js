/* globals expect */
var path = '../../../../build/shared/models/',
    Board = require(path + 'board.model.js').Board;

describe('Board', () => {
    var board;

    beforeEach(() => {
        var cols = [
                { id: 1, name: 'col1', position: 0, board_id: 1,
                  ownTask: [{ id: 1 }] }
            ],
            cats = [
                { id: 1, name: 'cat1', default_task_color: '#ffffe0', board_id: 1 }
            ],
            acts = [
                { id: 1, trigger: 1, source_id: 1, type: 1, change_to: '', board_id: 1 }
            ],
            tracks = [
                { id: 1, url: '', regex: '' }
            ],
            users = [
                {
                    default_board_id: 0, email: '', id: 1, last_login: null,
                    security_level: 1, user_option_id: 1, username: 'tester',
                    board_access: [ 1 ], collapsed: []
                }
            ];

        board = new Board(1, 'test', true, cols, cats, acts, tracks, users);
    });

    it('has sane defaults', () => {
        board = new Board();

        expect(board.id).to.equal(0);
        expect(board.name).to.equal('');
        expect(board.is_active).to.equal(true);
    });

    it('has id', () => {
        expect(board.id).to.be.a('number');
        expect(board.id).to.equal(1);
    });

    it('has name', () => {
        expect(board.name).to.be.a('string');
        expect(board.name).to.equal('test');
    });

    it('has is_active', () => {
        expect(board.is_active).to.be.a('boolean');
        expect(board.is_active).to.equal(true);
    });

    it('has columns', () => {
        expect(board.columns).to.be.an('array');
        expect(board.columns.length).to.equal(1);
    });

    it('has categories', () => {
        expect(board.categories).to.be.an('array');
        expect(board.categories.length).to.equal(1);
    });

    it('has auto_actions', () => {
        expect(board.auto_actions).to.be.an('array');
        expect(board.auto_actions.length).to.equal(1);
    });

    it('has issue_trackers', () => {
        expect(board.issue_trackers).to.be.an('array');
        expect(board.issue_trackers.length).to.equal(1);
    });

    it('has users', () => {
        expect(board.users).to.be.an('array');
        expect(board.users.length).to.equal(1);
    });

    it('has a method to add a column', () => {
        expect(board.addColumn).to.be.a('function');

        board.addColumn('test');
        expect(board.columns[1].name).to.equal('test');
    });

    it('has a method to add a category', () => {
        expect(board.addCategory).to.be.a('function');

        board.addCategory('test', 'color');
        expect(board.categories[1].name).to.equal('test');
        expect(board.categories[1].default_task_color).to.equal('color');
    });

    it('has a method to add an issue tracker', () => {
        expect(board.addIssueTracker).to.be.a('function');

        board.addIssueTracker('testUrl', 'testRegex');
        expect(board.issue_trackers[1].url).to.equal('testUrl');
        expect(board.issue_trackers[1].regex).to.equal('testRegex');
    });
});

