/* global expect */
var path = '../../../build/shared/',
    Constants = require(path + 'constants.js').Constants;

    describe('Constants', () => {
        var constants;

        beforeEach(() => {
            constants = new Constants();
        });

        it('has a VERSION', () => {
            expect(constants.VERSION).to.equal('1.0.0');
        });

        it('has a TOKEN', () => {
            expect(constants.TOKEN).to.equal('taskboard.jwt');
        });
    });

