/* global expect HttpMock */
var path = '../../../build/settings/',
    SettingsService = require(path + 'settings.service.js').SettingsService;

describe('UserAdminService', () => {
    var settingsService;

    beforeEach(() => {
        settingsService = new SettingsService(HttpMock);
    });

    it('provides a list of users', (done) => {
        settingsService.getUsers().subscribe(users => {
            expect(users.endpoint).to.equal('api/users');
            done();
        });
    });

    it('notifies subscribers when users are updated', (done) => {
        settingsService.usersChanged.subscribe((users) => {
            expect(users).to.be.an('array');
            done();
        });
    });
});

