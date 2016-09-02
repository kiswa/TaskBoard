/* global expect */
var path = '../../build/',
    routes = require(path + 'app.routes.js');

describe('Routes', () => {
    it('provides APP_ROUTING', () => {
        expect(routes.APP_ROUTING).to.be.an('object');
    });

    it('provides ROUTE_COMPONENTS', () => {
        expect(routes.ROUTE_COMPONENTS).to.be.an('array');
    });
});

