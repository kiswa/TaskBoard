/* global expect */
var path = '../../../../build/shared/models/',
    ApiResponse = require(path + 'api-response.model.js').ApiResponse;

describe('ApiResponse', () => {
    var apiResponse;

    beforeEach(() => {
        apiResponse = new ApiResponse([{ type: 'error', text: 'test' }],
                                      [{ data: 'whatever' }],
                                      'success');
    });

    it('has sane defaults', () => {
        apiResponse = new ApiResponse();

        expect(apiResponse.alerts.length).to.equal(0);
        expect(apiResponse.data.length).to.equal(0);
        expect(apiResponse.status).to.equal('');
    });

    it('has an alerts array', () => {
        expect(apiResponse.alerts).to.be.an('array');
        expect(apiResponse.alerts.length).to.equal(1);
    });

    it('has a data array', () => {
        expect(apiResponse.data).to.be.an('array');
        expect(apiResponse.data.length).to.equal(1);
    });

    it('has a status string', () => {
        expect(apiResponse.status).to.be.a('string');
        expect(apiResponse.status).to.equal('success');
    });
});

