/* global expect TitleMock StringsServiceMock */
var path = '../../../build/settings/',
    Settings = require(path + 'settings.component.js').Settings;

describe('Settings', () => {
    var title;

    beforeEach(() => {
        title = new TitleMock();
        // Just need to create Settings to set Title
        var settings = new Settings(null, StringsServiceMock, title);
        settings;
    });

    it('sets the site title when constructed', () => {
        expect(title.getTitle()).to.equal('TaskBoard - Settings');
    });
});

