/* global expect */
var path = '../../../../build/settings/board-admin/',
    BoardData = require(path + 'board-data.model.js').BoardData;

describe('BoardData', () => {
    var boardData;

    beforeEach(() => {
        boardData = new BoardData();
    });

    it('has a title property', () => {
        expect(boardData.title).to.be.a('string');
    });

    it('has an id property', () => {
        expect(boardData.id).to.be.a('number');
    });

    it('has a name property', () => {
        expect(boardData.name).to.be.a('string');
    });

    it('has an is_active property', () => {
        expect(boardData.is_active).to.be.a('boolean');
    });

    it('has a columns property', () => {
        expect(boardData.columns).to.be.an('array');
    });

    it('has a categories property', () => {
        expect(boardData.categories).to.be.an('array');
    });

    it('has an issue_trackers property', () => {
        expect(boardData.issue_trackers).to.be.an('array');
    });

    it('has a users property', () => {
        expect(boardData.users).to.be.an('array');
    });

    it('has a categoryDefaultColor property', () => {
        expect(boardData.categoryDefaultColor).to.be.a('string');
    });

    it('has a newColumnName property', () => {
        expect(boardData.newColumnName).to.be.a('string');
    });

    it('has a newCategoryName property', () => {
        expect(boardData.newCategoryName).to.be.a('string');
    });

    it('has an issueTrackerUrl property', () => {
        expect(boardData.issueTrackerUrl).to.be.a('string');
    });

    it('has an issueTrackerBugId property', () => {
        expect(boardData.issueTrackerBugId).to.be.a('string');
    });

    it('allows a column to be added', () => {
        boardData.addColumn();
        expect(boardData.columns.length).to.equal(0);

        boardData.newColumnName = 'test';
        boardData.addColumn();

        expect(boardData.columns.length).to.equal(1);
        expect(boardData.columns[0].name).to.equal('test');
        expect(boardData.newColumnName).to.equal('');
    });

    it('allows a column to be removed', () => {
        var column = { name: 'test' };
        boardData.removeColumn(column);

        boardData.columns.push(column);
        expect(boardData.columns.length).to.equal(1);

        boardData.removeColumn(column);
        expect(boardData.columns.length).to.equal(0);
    });

    it('allows a category to be added', () => {
        boardData.addCategory();
        expect(boardData.categories.length).to.equal(0);

        boardData.newCategoryName = 'test';
        boardData.categoryDefaultColor = '#ffffe0';
        boardData.addCategory();

        expect(boardData.categories.length).to.equal(1);
        expect(boardData.categories[0].name).to.equal('test');
        expect(boardData.newCategoryName).to.equal('');
        expect(boardData.categoryDefaultColor).to.equal('#ffffe0');
    });

    it('allows a category to be removed', () => {
        var category = { name: 'test', defaultColor: '#ffffe0' };
        boardData.removeCategory(category);

        boardData.categories.push(category);
        expect(boardData.categories.length).to.equal(1);

        boardData.removeCategory(category);
        expect(boardData.categories.length).to.equal(0);
    });

    it('allows an issue tracker to be added', () => {
        boardData.addIssueTracker();
        expect(boardData.issue_trackers.length).to.equal(0);

        boardData.issueTrackerUrl = 'test';
        boardData.issueTrackerBugId = 'test';
        boardData.addIssueTracker();

        expect(boardData.issue_trackers.length).to.equal(1);
        expect(boardData.issue_trackers[0].url).to.equal('test');
        expect(boardData.issueTrackerUrl).to.equal('');
        expect(boardData.issueTrackerBugId).to.equal('');
    });

    it('allows an issue tracker to be removed', () => {
        var issueTracker = { url: 'test', bugId: 'test' };
        boardData.removeIssueTracker(issueTracker);

        boardData.issue_trackers.push(issueTracker);
        expect(boardData.issue_trackers.length).to.equal(1);

        boardData.removeIssueTracker(issueTracker);
        expect(boardData.issue_trackers.length).to.equal(0);
    });
});

