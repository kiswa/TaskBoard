/* global expect, HttpMock */
var path = '../../../../build/shared/strings/',
    StringsService = require(path + 'strings.service.js').StringsService;

describe('StringsService', () => {
    var stringsService;

    beforeEach(() => {
        stringsService = new StringsService(HttpMock);
    });

    it('has stringsChanged observable', () => {
        expect(stringsService.stringsChanged).to.be.an('object');
    });

    it('loads a JSON file to get strings', done => {
        var first = true;

        stringsService.stringsChanged.subscribe(res => {
            if (first) {
                first = false;
                return;
            }

            expect(res.endpoint).to.equal('strings/test.json');
            done();
        });

        stringsService.loadStrings('test');
    });
});

