/* global expect AuthServiceMock SettingsServiceMock ModalServiceMock
    NotificationsServiceMock AutoActionsServiceMock StringsServiceMock SanitizerMock */
var dirs = '../../../../',
    path = dirs + 'build/settings/auto-actions/',
    AutoActions = require(path + 'auto-actions.component.js').AutoActions;

describe('AutoActions', () => {
    var autoActions,
        imodalService;

    beforeEach(() => {
        modalService = new ModalServiceMock();

        autoActions = new AutoActions(AuthServiceMock, modalService,
            new SettingsServiceMock(), new AutoActionsServiceMock(),
            new NotificationsServiceMock(), StringsServiceMock, SanitizerMock);
    });

    it('has a function to add an action', done => {
        autoActions.removeAutoAction();

        setTimeout(() => {
            expect(autoActions.autoActions.length).to.equal(1);
            done();
        }, 10);
    });

    it('has a function to remove an action', done => {
        autoActions.addNewAction();

        setTimeout(() => {
            expect(autoActions.newAction.id).to.equal(0);
            expect(autoActions.autoActions.length).to.equal(3);
            done();
        }, 10);

    });

    it('has a function to update the list of triggers', () => {
        autoActions.newAction.board_id = 1;

        autoActions.newAction.trigger = 1;
        autoActions.updateTriggerSources();

        expect(autoActions.triggerSources[1][1]).to.equal('Column 1');

        autoActions.newAction.trigger = 2;
        autoActions.updateTriggerSources();

        expect(autoActions.triggerSources[1][1]).to.equal('test');

        autoActions.newAction.trigger = 3;
        autoActions.updateTriggerSources();

        expect(autoActions.triggerSources[1][1]).to.equal('Category 1');

        autoActions.newAction.trigger = 4;
        autoActions.updateTriggerSources();

        expect(autoActions.triggerSources.length).to.equal(0);
    });

    it('has a function to update the list of action sources', () => {
        autoActions.newAction.type = 1;
        autoActions.updateActionSources();

        expect(autoActions.newAction.change_to).to.equal('#000000');

        autoActions.newAction.type = 2; // 2 and 3 are the same
        autoActions.updateActionSources();

        expect(autoActions.actionSources[0][1]).to.equal(undefined);

        autoActions.newAction.type = 4; // 4 and 5 are the same
        autoActions.updateActionSources();

        expect(autoActions.actionSources[0][1]).to.equal(undefined);
    });

    it('provides a description for a trigger', () => {
        var action = {
            id: 1,
            trigger: 1,
            source_id: 1,
            type: 1,
            change_to: 'test',
            board_id: 1
        };

        var desc = autoActions.getTriggerDescription(action);
        expect(desc).to.equal('undefined Column 1');

        action.trigger = 2;
        action.source_id = 2;

        desc = autoActions.getTriggerDescription(action);
        expect(desc).to.equal('undefined test');

        action.trigger = 3;
        action.source_id = 1;

        desc = autoActions.getTriggerDescription(action);
        expect(desc).to.equal('undefined Category 1');

        action.trigger = 4;

        desc = autoActions.getTriggerDescription(action);
        expect(desc + '').to.equal('undefined');
    });

    it('provides a description for an action type', () => {
        var action = {
            id: 1,
            trigger: 1,
            source_id: 1,
            type: 1,
            change_to: '#fff',
            board_id: 1
        };

        var desc = autoActions.getTypeDescription(action);
        expect(desc).to.equal('undefined <span style="background-color: #fff;">#fff</span>');

        action.type = 2;
        action.change_to = 1;
        desc = autoActions.getTypeDescription(action);

        expect(desc).to.equal('undefined Category 1');

        action.type = 3;
        action.change_to = 1;
        desc = autoActions.getTypeDescription(action);

        expect(desc).to.equal('undefined Category 1');

        action.type = 4;
        action.change_to = 2;
        desc = autoActions.getTypeDescription(action);

        expect(desc).to.equal('undefined test');

        action.type = 5;
        action.change_to = 2;
        desc = autoActions.getTypeDescription(action);

        expect(desc).to.equal('undefined test');

        action.type = 6;
        desc = autoActions.getTypeDescription(action);

        expect(desc + '').to.equal('undefined');

        action.type = 7;
        desc = autoActions.getTypeDescription(action);

        expect(desc + '').to.equal('undefined');
    });
});

