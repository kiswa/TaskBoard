/* global UserAdminServiceMock NotificationsServiceMock AuthServiceMock ModalServiceMock */
var chai = require('chai'),
    expect = chai.expect,
    path = '../../../../build/settings/user-admin/',
    UserAdmin = require(path + 'user-admin.component.js').UserAdmin;

describe('UserAdmin', () => {
    var userAdmin,
        modalService;

    beforeEach(() => {
        modalService = new ModalServiceMock();

        userAdmin = new UserAdmin(new UserAdminServiceMock(),
            new NotificationsServiceMock(),
            AuthServiceMock, modalService);
    });

    it('has a function to add or edit a user - Add', (done) => {
        userAdmin.modalProps.title = 'Add';
        userAdmin.modalProps.user = {
            username: 'testing',
            password: 'test',
            verifyPassword: 'test',
            email: ''
        };

        userAdmin.addEditUser();

        setTimeout(() => {
            expect(userAdmin.users.length).to.equal(3);
            done();
        }, 10);
    });

    it('has a function to add or edit a user - Edit', (done) => {
        userAdmin.modalProps.title = 'Edit';
        userAdmin.modalProps.user = {
            id: 1,
            username: 'testing',
            password: 'test',
            verifyPassword: 'test',
            email: ''
        };

        userAdmin.addEditUser();

        setTimeout(() => {
            expect(userAdmin.users.length).to.equal(2);
            expect(userAdmin.users[0].username).to.equal('changed');
            done();
        }, 10);
    });

    it('has a function to validate a user', () => {
        userAdmin.modalProps.user = { username: '' };
        expect(userAdmin.validateModalUser()).to.equal(false);

        userAdmin.modalProps.user.username = 'user';
        userAdmin.modalProps.user.password = '';
        expect(userAdmin.validateModalUser()).to.equal(false);

        userAdmin.modalProps.user.password = 'test';
        userAdmin.modalProps.user.verifyPassword = '';
        expect(userAdmin.validateModalUser()).to.equal(false);

        userAdmin.modalProps.user.verifyPassword = 'test';
        userAdmin.modalProps.user.email = 'invalid';
        expect(userAdmin.validateModalUser()).to.equal(false);

        userAdmin.modalProps.user.email = 'email@test.com';
        expect(userAdmin.validateModalUser()).to.equal(true);
    });

    it('has a function to remove a user', (done) => {
        userAdmin.userToRemove = { id: 1 };
        userAdmin.removeUser();

        setTimeout(() => {
            expect(userAdmin.users.length).to.equal(1);
            done();
        }, 10);
    });

    it('has a showModal function', (done) => {
        modalService.openCalled.subscribe((modalId) => {
            expect(modalId).to.equal(userAdmin.MODAL_ID);
            done();
        });

        userAdmin.showModal('Add');
    });

    it('has a showConfirmModal function', (done) => {
        modalService.openCalled.subscribe((modalId) => {
            expect(modalId).to.equal(userAdmin.MODAL_CONFIRM_ID);
            expect(userAdmin.userToRemove).to.equal(true);
            done();
        });

        userAdmin.showConfirmModal(true);
    });
});

