/* globals expect */
var path = '../../../../build/shared/models/',
    Board = require(path + 'board.model.js').Board;

describe('Board', () => {
    var board;

    beforeEach(() => {
        board = new Board();
    });

    it('has id', () => {
        expect(board.id).to.be.a('number');
        expect(board.id).to.equal(0);
    });

    it('has name', () => {
        expect(board.name).to.be.a('string');
        expect(board.name).to.equal('');
    });

    it('has is_active', () => {
        expect(board.is_active).to.be.a('boolean');
        expect(board.is_active).to.equal(true);
    });

    it('has columns', () => {
        expect(board.columns).to.be.an('array');
        expect(board.columns.length).to.equal(0);
    });

    it('has categories', () => {
        expect(board.categories).to.be.an('array');
        expect(board.categories.length).to.equal(0);
    });

    it('has auto_actions', () => {
        expect(board.auto_actions).to.be.an('array');
        expect(board.auto_actions.length).to.equal(0);
    });

    it('has issue_trackers', () => {
        expect(board.issue_trackers).to.be.an('array');
        expect(board.issue_trackers.length).to.equal(0);
    });

    it('has users', () => {
        expect(board.users).to.be.an('array');
        expect(board.users.length).to.equal(0);
    });

    it('has a method to add a column', () => {
        expect(board.addColumn).to.be.a('function');

        board.addColumn('test');
        expect(board.columns[0].name).to.equal('test');
    });

    it('has a method to add a category', () => {
        expect(board.addCategory).to.be.a('function');

        board.addCategory('test', 'color');
        expect(board.categories[0].name).to.equal('test');
        expect(board.categories[0].default_task_color).to.equal('color');
    });

    it('has a method to add an issue tracker', () => {
        expect(board.addIssueTracker).to.be.a('function');

        board.addIssueTracker('testUrl', 'testRegex');
        expect(board.issue_trackers[0].url).to.equal('testUrl');
        expect(board.issue_trackers[0].regex).to.equal('testRegex');
    });
});

