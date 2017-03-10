/* global expect ConstantsMock RouterMock AuthServiceMock NotificationsServiceMock StringsServiceMock */
var path = '../../../../build/shared/top-nav/',
    TopNav = require(path + 'top-nav.component.js').TopNav;

describe('TopNav', () => {
    var topNav,
        router;

    beforeEach(() => {
        router = new RouterMock();
        topNav = new TopNav(ConstantsMock, router,
            AuthServiceMock, new NotificationsServiceMock(),
            StringsServiceMock);
    });

    it('has pageName', () => {
        expect(topNav.pageName).to.be.a('string');
        expect(topNav.pageName).to.equal('');
    });

    it('has version', () => {
        expect(topNav.version).to.be.a('string');
        expect(topNav.version).to.equal('TEST');
    });

    it('has username', () => {
        expect(topNav.username).to.be.a('string');
        expect(topNav.username).to.equal('tester');
    });

    it('allows a user to log out', () => {
        expect(router.path).to.equal('test');
        topNav.logout();
        expect(router.path).to.equal('');
    });

    it('can tell if a route is active', () => {
        expect(topNav.isActive('test')).to.equal(true);
        expect(topNav.isActive('whatever')).to.equal(false);
    });

    it('can navigate to a new path', () => {
        expect(router.path).to.equal('test');
        topNav.navigateTo('newRoute');
        expect(router.path).to.equal('/newRoute');
    });
});

