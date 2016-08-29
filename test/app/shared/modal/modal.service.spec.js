/* globals expect AuthServiceMock */
var path = '../../../../build/shared/modal/',
    ModalService = require(path + 'modal.service.js').ModalService;

describe('ModalService', () => {
    var modalService,
        modal;

    beforeEach(() => {
        modalService = new ModalService(AuthServiceMock);
        modal = {
            modalId: 'testModal',
            isOpen: false
        };
    });

    it('has an array of modals', () => {
        expect(modalService.modals).to.be.an('array');
        expect(modalService.modals.length).to.equal(0);
    });

    it('has a function to register a modal', () => {
        expect(modalService.registerModal).to.be.a('function');

        modalService.registerModal(modal);
        expect(modalService.modals[0].modalId).to.equal(modal.modalId);
    });

    it('will not register the same modal twice', () => {
        modalService.registerModal(modal);
        expect(modalService.modals.length).to.equal(1);

        modalService.registerModal(modal);
        expect(modalService.modals.length).to.equal(1);
    });

    it('has a function to open a modal', () => {
        modalService.registerModal(modal);
        modalService.open(modal.modalId);

        expect(modalService.modals[0].isOpen).to.equal(true);
    });

    it('has a function to close a modal', () => {
        modal.isOpen = true;
        modalService.registerModal(modal);

        modalService.close(modal.modalId);
        expect(modalService.modals[0].isOpen).to.equal(false);

        modalService.modals[0].isOpen = true;
        modal.blocking = true;
        modalService.close(modal.modalId, true);
        expect(modalService.modals[0].isOpen).to.equal(true);
    });
});

