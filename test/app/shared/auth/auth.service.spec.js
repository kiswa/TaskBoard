/* global ConstantsMock, HttpMock, RouterMock */
var chai = require('chai'),
    expect = chai.expect,
    path = '../../../../build/shared/auth/',
    AuthService = require(path + 'auth.service.js').AuthService;

describe('AuthService', () => {
    var authService;

    beforeEach(() => {
        authService = new AuthService(ConstantsMock,
            HttpMock, new RouterMock());
    });

    it('has userOptions', () => {
        expect(authService.userOptions).to.equal(null);
    });

    it('has userChanged observable', () => {
        expect(authService.userChanged).to.be.an('object');
    });

    it('notifies subscribers when the active user changes', (done) => {
        authService.updateUser(true);

        authService.userChanged.subscribe(user => {
            expect(user).to.equal(true);
            done();
        });
    });

    it('updates user options when the active user changes', (done) => {
        authService.updateUser('', true);

        authService.userChanged.subscribe(user => {
            expect(authService.userOptions).to.equal(true);
            done();
        });
    });

    it('calls the API to authenticate a JWT', (done) => {
        authService.authenticate().subscribe(test => {
            expect(test).to.equal(true);
            done();
        });
    });

    it('calls the API to log in', (done) => {
        authService.login('user', 'pass', false).subscribe(res => {
            expect(res.status).to.equal('success');
            expect(res.endpoint).to.equal('api/login');
            done();
        });
    });

    it('calls the API to log out', (done) => {
        authService.logout().subscribe(res => {
            expect(res.status).to.equal('success');
            expect(res.endpoint).to.equal('api/logout');
            done();
        });
    });
});

