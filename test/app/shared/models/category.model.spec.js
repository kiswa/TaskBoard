/* global expect */
var path = '../../../../build/shared/models/',
    Category = require(path + 'category.model.js').Category;

describe('Category', () => {
    var category;

    beforeEach(() => {
        category = new Category();
    });

    it('has an id', () => {
        expect(category.id).to.be.a('number');
        expect(category.id).to.equal(0);
    });

    it('has a name', () => {
        expect(category.name).to.be.a('string');
        expect(category.name).to.equal('');
    });

    it('has a default_task_color', () => {
        expect(category.default_task_color).to.be.a('string');
        expect(category.default_task_color).to.equal('');
    });

    it('has a board_id', () => {
        expect(category.board_id).to.be.a('number');
        expect(category.board_id).to.equal(0);
    });
});

