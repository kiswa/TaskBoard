/* global expect */
var path = '../../../../build/shared/models/',
    Comment = require(path + 'comment.model.js').Comment;

describe('Comment', () => {
    var comment;

    beforeEach(() => {
        comment = new Comment(1, 'text', 1, 1);
    });

    it('has sane defauls', () => {
        comment =new Comment();

        expect(comment.id).to.equal(0);
        expect(comment.text).to.equal('');
        expect(comment.user_id).to.equal(0);
        expect(comment.task_id).to.equal(0);
    });

    it('has an id', () => {
        expect(comment.id).to.be.a('number');
        expect(comment.id).to.equal(1);
    });

    it('has a text', () => {
        expect(comment.text).to.be.a('string');
        expect(comment.text).to.equal('text');
    });

    it('has a user_id', () => {
        expect(comment.user_id).to.be.a('number');
        expect(comment.user_id).to.equal(1);
    });

    it('has a task_id', () => {
        expect(comment.task_id).to.be.a('number');
        expect(comment.task_id).to.equal(1);
    });
});

