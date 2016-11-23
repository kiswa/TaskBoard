/* global expect HttpMock */
var path = '../../../../build/settings/user-admin/',
    UserAdminService = require(path + 'user-admin.service.js').UserAdminService;

describe('UserAdminService', () => {
    var userAdminService;

    beforeEach(() => {
        userAdminService = new UserAdminService(HttpMock);
    });

    it('allows a user to be added', done => {
        userAdminService.addUser(null).subscribe(user => {
            expect(user.endpoint).to.equal('api/users');
            done();
        });
    });

    it('allows a user to be edited', done => {
        userAdminService.editUser({ id: 1 }).subscribe(user => {
            expect(user.endpoint).to.equal('api/users/1');
            done();
        });
    });

    it('allows a user to be removed', done => {
        userAdminService.removeUser(1).subscribe(user => {
            expect(user.endpoint).to.equal('api/users/1');
            done();
        });
    });
});

