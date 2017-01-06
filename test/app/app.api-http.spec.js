/* globals expect RxJs localStorage */
require('reflect-metadata/Reflect.js');

var path = '../../build/app.',
    apihttp = require(path + 'api-http.js'),
    ApiHttp = apihttp.ApiHttp;

describe('ApiHttp', () => {
    var apiHttp;

    beforeEach(() => {
        apiHttp = new ApiHttp();
    });

    it('provides API_HTTP_PROVIDERS', () => {
        var provider = apihttp.API_HTTP_PROVIDERS;
        expect(provider).to.be.an('array');
    });

    it('has JWT_KEY', () => {
        expect(apiHttp.JWT_KEY).to.equal('taskboard.jwt');
    });

    it('injects headers', () => {
        localStorage.setItem('taskboard.jwt', 'testjwt');

        var headers = apiHttp.getRequestOptionArgs().headers;

        expect(headers._headers.get('content-type')[0])
            .to.equal('application/json');
        expect(headers._headers.get('authorization')[0])
            .to.equal('testjwt');
    });

    it('intercepts observable responses', () => {
        var response = {
            json() {
                return {
                    data: ['testjwt']
                };
            }
        };

        apiHttp.intercept(RxJs.Observable.of(response))
            .map(response => {
                expect(localStorage.getItem('taskboard.jwt'))
                    .to.equal('testjwt');
            });

        apiHttp.intercept(RxJs.Observable.throw(null, response))
            .catch((err, caught) => {
                expect(localStorage.getItem('taskboard.jwt'))
                    .to.equal('');
            });
    });
});

