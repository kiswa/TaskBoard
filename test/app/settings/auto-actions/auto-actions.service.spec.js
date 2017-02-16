/* globals expect HttpMock */
var dirs = '../../../../',
    path = dirs + 'build/settings/auto-actions/',
    AutoActionsService = require(path + 'auto-actions.service.js').AutoActionsService;

describe('AutoActionsService', () => {
    var service;

    beforeEach(() => {
        service = new AutoActionsService(HttpMock);
    });

    it('allows an action to be added', done => {
        service.addAction(null).subscribe(action => {
            expect(action.endpoint).to.equal('api/autoactions');
            done();
        });
    });

    it('allows an action to be removed', done => {
        service.removeAction({ id: 1 }).subscribe(action => {
            expect(action.endpoint).to.equal('api/autoactions/1');
            done();
        });
    });
});

