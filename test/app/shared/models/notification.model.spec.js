/* global expect */
var path = '../../../../build/shared/models/',
    Notification = require(path + 'notification.model.js').Notification;

describe('Notification', () => {
    var notification;

    beforeEach(() => {
        notification = new Notification();
    });

    it('has type', () => {
        expect(notification.type).to.be.a('string');
        expect(notification.type).to.equal('');
    });

    it('has text', () => {
        expect(notification.text).to.be.a('string');
        expect(notification.text).to.equal('');
    });
});

