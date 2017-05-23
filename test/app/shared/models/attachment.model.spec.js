/* global expect */
var path = '../../../../build/shared/models/',
    Attachment = require(path + 'attachment.model.js').Attachment;

describe('Attachment', () => {
    var attachment,
        now = new Date();

    beforeEach(() => {
        attachment = new Attachment();
    });

    it('has an id', () => {
        expect(attachment.id).to.be.a('number');
        expect(attachment.id).to.equal(0);
    });

    it('has a filename', () => {
        expect(attachment.filename).to.be.a('string');
        expect(attachment.filename).to.equal('');
    });

    it('has a name', () => {
        expect(attachment.name).to.be.a('string');
        expect(attachment.name).to.equal('');
    });

    it('has a type', () => {
        expect(attachment.type).to.be.a('string');
        expect(attachment.type).to.equal('');
    });

    it('has a user_id', () => {
        expect(attachment.user_id).to.be.a('number');
        expect(attachment.user_id).to.equal(0);
    });

    it('has a timestamp', () => {
        attachment = new Attachment(0, '', '', '', 0, now, 0);

        expect(attachment.timestamp).to.be.a('date');
        expect(attachment.timestamp).to.equal(now);
    });

    it('has a task_id', () => {
        expect(attachment.task_id).to.be.a('number');
        expect(attachment.task_id).to.equal(0);
    });
});

