/* global expect ConstantsMock AuthServiceMock RouterMock NotificationsServiceMock */
var path = '../../../build/login/',
    Login = require(path + 'login.component.js').Login;

describe('Login', () => {
    var login,
        router;

    beforeEach(() => {
        router = new RouterMock();
        login = new Login(ConstantsMock, AuthServiceMock,
            router, new NotificationsServiceMock());
    });

    it('has a version property', () => {
        expect(login.version).to.equal('TEST');
    });

    it('has a username property', () => {
        expect(login.username).to.equal('');
    });

    it('has a password property', () => {
        expect(login.password).to.equal('');
    });

    it('has a remember property', () => {
        expect(login.remember).to.equal(false);
    });

    it('has a isSubmitted property', () => {
       expect(login.isSubmitted) .to.equal(false);
    });

    it('requires both username and password to log in', (done) => {
        login.notes.noteAdded.subscribe(note => {
            expect(note.type).to.equal('error');
            done();
        });

        login.username = 'test';
        login.login();
    });

    it('calls the AuthService to log in and navigates the router', (done) => {
        login.username = 'test';
        login.password = 'test';
        login.login();

        setTimeout(() => {
            expect(router.path).to.equal('/boards');
            done();
        }, 10);
    });
});

