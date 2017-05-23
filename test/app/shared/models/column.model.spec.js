/* global expect */
var path = '../../../../build/shared/models/',
    Column = require(path + 'column.model.js').Column;

describe('ApiResponse', () => {
    var column;

    beforeEach(() => {
        column = new Column();
    });

    it('has an id', () => {
        expect(column.id).to.be.a('number');
        expect(column.id).to.equal(0);
    });

    it('has a name', () => {
        expect(column.name).to.be.a('string');
        expect(column.name).to.equal('');
    });

    it('has a position', () => {
        expect(column.position).to.be.a('number');
        expect(column.position).to.equal(0);
    });

    it('has a board_id', () => {
        expect(column.board_id).to.be.a('number');
        expect(column.board_id).to.equal(0);
    });

    it('has tasks', () => {
        expect(column.tasks).to.be.an('array');
        expect(column.tasks.length).to.equal(0);
    });
});

