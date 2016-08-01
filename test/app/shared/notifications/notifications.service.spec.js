var chai = require('chai'),
    expect = chai.expect,
    path = '../../../../build/shared/notifications/',
    NotificationsService = require(path + 'notifications.service.js')
        .NotificationsService;

describe('NotificationsService', () => {
    var notificationsService;

    beforeEach(() => {
        notificationsService = new NotificationsService();
    });

    it('has an observable of added notes', () => {
        expect(notificationsService.noteAdded).to.be.an('object');
        expect(notificationsService.noteAdded.subscribe).to.be.a('function');
    });

    it('has a method to add notifications', (done) => {
        notificationsService.noteAdded.subscribe(note => {
            expect(note).to.equal(true);
            done();
        });

        notificationsService.add(true);
    });
});

