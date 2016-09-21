/* global expect AuthServiceMock HttpMock */
var path = '../../../../build/settings/user-settings/',
    UserSettingsService =
        require(path + 'user-settings.service.js').UserSettingsService;

describe('UserSettingsService', () => {
    var userSettingsService;

    beforeEach(() => {
        userSettingsService = new UserSettingsService(AuthServiceMock,
            HttpMock);
    });

    it('calls the api to change the default board', (done) => {
        userSettingsService.changeDefaultBoard('1').subscribe(data => {
            expect(data.endpoint).to.equal('api/users/1');
            done();
        });
    });

    it('calls the api to change a password', (done) => {
        userSettingsService.changePassword('old', 'new').subscribe(data => {
            expect(data.endpoint).to.equal('api/users/1');
            done();
        });
    });

    it('calls the api to change a username', (done) => {
        userSettingsService.changeUsername('tester').subscribe(data => {
            expect(data.endpoint).to.equal('api/users/1');
            done();
        });
    });

    it('calls the api to change an email', (done) => {
        userSettingsService.changeEmail('newEmail').subscribe(data => {
            expect(data.endpoint).to.equal('api/users/1');
            done();
        });
    });

    it('calls the api to change a user option', (done) => {
        userSettingsService.changeUserOptions({}).subscribe(data => {
            expect(data.endpoint).to.equal('api/users/1/opts');
            done();
        });
    });
});

