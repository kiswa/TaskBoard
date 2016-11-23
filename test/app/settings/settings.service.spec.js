/* global expect HttpMock */
var path = '../../../build/settings/',
    SettingsService = require(path + 'settings.service.js').SettingsService;

describe('UserAdminService', () => {
    var settingsService;

    beforeEach(() => {
        settingsService = new SettingsService(HttpMock);
    });

    it('provides a list of users', done => {
        settingsService.getUsers().subscribe(users => {
            expect(users.endpoint).to.equal('api/users');
            done();
        });
    });

    it('provides a list of boards', done => {
        settingsService.getBoards().subscribe(users => {
            expect(users.endpoint).to.equal('api/boards');
            done();
        });
    });

    it('allows updating users and notifies subscribers', done => {
        var first = true;

        settingsService.usersChanged.subscribe(users => {
            expect(users).to.be.an('array');

            if (first) {
                first = false;
                return;
            }

            done();
        });

        settingsService.updateUsers([]);
    });

    it('allows updating boards and notifies subscribers', done => {
        var first = true;

        settingsService.boardsChanged.subscribe(boards => {
            expect(boards).to.be.an('array');

            if (first) {
                first = false;
                return;
            }

            done();
        });

        settingsService.updateBoards([]);
    });
});

