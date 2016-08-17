/* global expect */
var path = '../../build/',
    AppModule = require(path + 'app.module.js').AppModule;

describe('Module', () => {
    it('provides an AppModule class', () => {
        var appModule = new AppModule();
        expect(appModule).to.be.an('object');
    });
});

