/* global expect TitleMock */
var path = '../../../build/settings/',
    Settings = require(path + 'settings.component.js').Settings;

describe('Settings', () => {
    var title;

    beforeEach(() => {
        title = new TitleMock();
        new Settings(null, title);
    });

    it('sets the site title when constructed', () => {
        expect(title.getTitle()).to.equal('TaskBoard - Settings');
    });
});

