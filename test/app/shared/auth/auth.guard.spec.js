/* global expect AuthServiceMock */
var path = '../../../../build/shared/auth/',
    AuthGuard = require(path + 'auth.guard.js').AuthGuard;

describe('AuthGuard', () => {
    var authGuard;

    beforeEach(() => {
        authGuard = new AuthGuard(AuthServiceMock);
    });

    it('checks a route can activate via the auth service', done => {
        authGuard.canActivate().subscribe(isAuth => {
            expect(isAuth).to.equal(true);
            done();
        });
    });
});

