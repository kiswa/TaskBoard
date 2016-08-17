/* global  expect NotificationsServiceMock */
var path = '../../../../build/shared/notifications/',
    Notifications = require(path + 'notifications.component.js').Notifications;

describe('Notifications', () => {
    var notifications,
        notificationsService;

    beforeEach(() => {
        notificationsService = new NotificationsServiceMock();
        notifications = new Notifications(notificationsService);
    });

    it('has an array of notes', () => {
        expect(notifications.notes).to.be.an('array');
    });

    it('subscribes to note additions', () => {
        notificationsService.add(true);
        expect(notifications.notes[0]).to.equal(true);
    });

    it('hides a specific note', (done) => {
        var note = { test: 'test note', type: '' };

        notificationsService.add(note);
        expect(notifications.notes.length).to.equal(1);

        notifications.hide(note);
        setTimeout(() => {
            expect(notifications.notes.length).to.equal(0);
            done();
        }, 510);
    });
});

