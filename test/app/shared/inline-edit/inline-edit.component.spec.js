/* global expect */
var path = '../../../../build/shared/inline-edit/',
    InlineEdit = require(path + 'inline-edit.component.js').InlineEdit;

describe('InlineEdit', () => {
    var inlineEdit;

    beforeEach(() => {
        inlineEdit = new InlineEdit();
    });

    it('has a beginEdit method', done => {
        expect(inlineEdit.beginEdit).to.be.a('function');

        var called = false,
            el = {
                focus: () => {
                    called = true;
                }
            };

        inlineEdit.beginEdit(el);
        expect(inlineEdit.isDisplay).to.equal(false);

        setTimeout(() => {
            expect(called).to.equal(true);
            done();
        }, 110);
    });

    it('has an editDone function', done => {
        expect(inlineEdit.editDone).to.be.a('function');

        inlineEdit.edit.subscribe(text => {
            expect(text).to.equal('test');
            done();
        });

        inlineEdit.editDone('test', { stopPropagation: () => {} });
    });
});

