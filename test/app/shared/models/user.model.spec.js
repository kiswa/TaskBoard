/* globals expect */
var path = '../../../../build/shared/models/',
    User = require(path + 'user.model.js').User;

describe('User', () => {
    var user;

    beforeEach(() => {
        user = new User();
    });

    it('has default_board_id', () => {
        expect(user.default_board_id).to.be.a('number');
        expect(user.default_board_id).to.equal(0);
    });

    it('has email', () => {
        expect(user.email).to.be.a('string');
        expect(user.email).to.equal('');
    });

    it('has id', () => {
        expect(user.id).to.be.a('number');
        expect(user.id).to.equal(0);
    });

    it('has last_login', () => {
        expect(user.last_login).to.equal(null);
    });

    it('has security_level', () => {
        expect(user.security_level).to.be.a('number');
        expect(user.security_level).to.equal(4);
    });

    it('has user_option_id', () => {
        expect(user.user_option_id).to.be.a('number');
        expect(user.user_option_id).to.equal(0);
    });

    it('has username', () => {
        expect(user.username).to.be.a('string');
        expect(user.username).to.equal('');
    });

    it('has a method to check for admin', () => {
        expect(user.isAdmin).to.be.a('function');
        expect(user.isAdmin()).to.equal(false);
    });

    it('has a method to check for board admin', () => {
        expect(user.isBoardAdmin).to.be.a('function');
        expect(user.isBoardAdmin()).to.equal(false);
    });

    it('has a method to check for any admin', () => {
        expect(user.isAnyAdmin).to.be.a('function');
        expect(user.isAnyAdmin()).to.equal(false);
    });
});

