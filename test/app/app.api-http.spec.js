require('reflect-metadata/Reflect.js');

var chai = require('chai'),
    expect = chai.expect,
    path = '../../build/app.',
    apihttp = require(path + 'api-http.js'),
    ApiHttp = apihttp.ApiHttp,
    RxJs = require('rxjs/Rx');

global.localStorage = (function() {
    var storage = {};

    return {
        getItem: (key) => {
            if (storage.hasOwnProperty(key)) {
                return storage[key];
            } else {
                return '';
            }
        },
        setItem: (key, value) => {
            storage[key] = value;
        },
        removeItem: (key) => {
            if (storage.hasOwnProperty(key)) {
                delete storage[key];
            }
        }
    };
})();

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
        global.localStorage.setItem('taskboard.jwt', 'testjwt');

        var headers = apiHttp.getRequestOptionArgs().headers;

        expect(headers._headersMap.get('Content-Type')[0])
            .to.equal('application/json');
        expect(headers._headersMap.get('Authorization')[0])
            .to.equal('testjwt');
    });

    it('intercepts observable responses', () => {
        var response = {
            json: function() {
                return {
                    data: ['testjwt']
                };
            }
        };

        apiHttp.intercept(RxJs.Observable.of(response))
            .map(response => {
                expect(global.localStorage.getItem('taskboard.jwt'))
                    .to.equal('testjwt');
            });

        apiHttp.intercept(RxJs.Observable.throw(null, response))
            .catch((err, caught) => {
                expect(global.localStorage.getItem('taskboard.jwt'))
                    .to.equal('');
            });
    });
});

