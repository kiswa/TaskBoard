/* global expect */
var path = '../../../../build/shared/models/',
    UserOptions = require(path + 'user-options.model.js').UserOptions;

describe('UserOptions', () => {
    var userOptions;

    beforeEach(() => {
        userOptions = new UserOptions(1, false, false, false, true, 'es');
    });

    it('has sane defaults', () => {
        userOptions = new UserOptions();

        expect(userOptions.id).to.equal(0);
        expect(userOptions.new_tasks_at_bottom).to.equal(true);
        expect(userOptions.show_animations).to.equal(true);
        expect(userOptions.show_assignee).to.equal(true);
        expect(userOptions.multiple_tasks_per_row).to.equal(false);
        expect(userOptions.language).to.equal('en');
    });

    it('has an id', () => {
        expect(userOptions.id).to.be.a('number');
        expect(userOptions.id).to.equal(1);
    });

    it('has boolean settings', () => {
        expect(userOptions.new_tasks_at_bottom).to.be.a('boolean');
        expect(userOptions.new_tasks_at_bottom).to.equal(false);

        expect(userOptions.show_animations).to.be.a('boolean');
        expect(userOptions.show_animations).to.equal(false);

        expect(userOptions.show_assignee).to.be.a('boolean');
        expect(userOptions.show_assignee).to.equal(false);

        expect(userOptions.multiple_tasks_per_row).to.be.a('boolean');
        expect(userOptions.multiple_tasks_per_row).to.equal(true);
    });

    it('has a language', () => {
        expect(userOptions.language).to.be.a('string');
        expect(userOptions.language).to.equal('es');
    });
});

