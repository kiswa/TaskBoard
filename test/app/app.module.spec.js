/* global expect */
var path = '../../build/',
    AppModule = require(path + 'app.module.js').AppModule;

try {
    require(path + 'main.js');
} catch (ex) {
    // Ignore for coverage
}

describe('Module', () => {
    it('provides an AppModule class', () => {
        var appModule = new AppModule();
        expect(appModule).to.be.an('object');
    });
});

