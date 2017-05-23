/* global expect */
var path = '../../../../build/shared/models/',
    IssueTracker = require(path + 'issue-tracker.model.js').IssueTracker;

describe('IssueTracker', () => {
    var issueTracker;

    beforeEach(() => {
        issueTracker = new IssueTracker(1, 'url', 'regex');
    });

    it('has sane defaults', () => {
        issueTracker = new IssueTracker();

        expect(issueTracker.id).to.equal(0);
        expect(issueTracker.url).to.equal('');
        expect(issueTracker.regex).to.equal('');
    });

    it('has an id', () => {
        expect(issueTracker.id).to.be.a('number');
        expect(issueTracker.id).to.equal(1);
    });

    it('has a url', () => {
        expect(issueTracker.url).to.be.a('string');
        expect(issueTracker.url).to.equal('url');
    });

    it('has a regex', () => {
        expect(issueTracker.regex).to.be.a('string');
        expect(issueTracker.regex).to.equal('regex');
    });
});

