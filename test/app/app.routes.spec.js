var chai = require('chai'),
    expect = chai.expect,
    path = '../../build/',
    routes = require(path + 'app.routes.js');

describe('Routes', () => {
    it('provides APP_ROUTER_PROVIDERS', () => {
        expect(routes.APP_ROUTER_PROVIDERS).to.be.an('array');
    });
});

