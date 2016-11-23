/* global expect ModalServiceMock */
var path = '../../../../build/shared/modal/',
    Modal = require(path + 'modal.component.js').Modal;

describe('Modal', () => {
    var modal,
        modalService;

    beforeEach(() => {
        modalService = new ModalServiceMock();
        modal = new Modal(modalService);
    });

    it('has modalId property', () => {
        expect(modal.modalId).to.be.a('string');
    });

    it('has modalTitle property', () => {
        expect(modal.modalTitle).to.be.a('string');
    });

    it('has blocking property', () => {
        expect(modal.blocking).to.be.a('boolean');
    });

    it('has isOpen property', () => {
        expect(modal.isOpen).to.be.a('boolean');
    });

    it('registers itself with the modal service on init', done => {
        modalService.registerCalled.subscribe(called => {
            expect(called).to.equal(true);
            done();
        });
        modal.ngOnInit();
    });

    it('calls the close function on the service', done => {
        modalService.closeCalled.subscribe(called => {
            expect(called).to.equal(true);
            done();
        });
        modal.close();
    });

    it('calls close on Escape keypress', done => {
        modalService.closeCalled.subscribe(called => {
            expect(called).to.equal(true);
            done();
        });
        modal.keyup({ keyCode: 27 });
    });

    it('filters clicks on the modal to prevent closing', () => {
        var stopCalled = false,
            eventStop = {
                stopPropagation: () => {
                    stopCalled = true;
                }
            },
            eventCancel = {
                cancelBubble: false
            };

        modal.filterClick(eventStop);
        expect(stopCalled).to.equal(true);

        modal.filterClick(eventCancel);
        expect(eventCancel.cancelBubble).to.equal(true);
    });
});

