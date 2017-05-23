/* global expect */
var path = '../../../../build/shared/models/',
    AutoAction = require(path + 'auto-actions.model.js').AutoAction;

describe('AutoAction', () => {
    var autoAction;

    beforeEach(() => {
        autoAction = new AutoAction();
    });

    it('has an id', () => {
        expect(autoAction.id).to.be.a('number');
        expect(autoAction.id).to.equal(0);
    });

    it('has a trigger', () => {
        expect(autoAction.trigger).to.be.a('number');
        expect(autoAction.trigger).to.equal(1);
    });

    it('has a source_id', () => {
        expect(autoAction.source_id).to.equal(null);
    });

    it('has a type', () => {
        expect(autoAction.type).to.be.a('number');
        expect(autoAction.type).to.equal(1);
    });

    it('has a change_to', () => {
        expect(autoAction.change_to).to.equal(null);
    });

    it('has a board_id', () => {
        expect(autoAction.board_id).to.equal(null);
    });
});

