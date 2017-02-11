/* global expect HttpMock */
var dirs = '../../../../',
    path = dirs + 'build/settings/board-admin/',
    BoardAdminService = require(path + 'board-admin.service.js').BoardAdminService;

describe('BoardAdmin', () => {
    var service;

    beforeEach(() => {
        service = new BoardAdminService(HttpMock);
    });

    it('allows a board to be added', done => {
        service.addBoard(null).subscribe(board => {
            expect(board.endpoint).to.equal('api/boards');
            done();
        });
    });

    it('allows a board to be edited', done => {
        service.editBoard({ id: 1 }).subscribe(board => {
            expect(board.endpoint).to.equal('api/boards/1');
            done();
        });
    });

    it('allows a board to be removed', done => {
        service.removeBoard(1).subscribe(board => {
            expect(board.endpoint).to.equal('api/boards/1');
            done();
        });
    });
});
