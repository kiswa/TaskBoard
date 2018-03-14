import {
  HttpModule,
  XHRBackend,
  CookieXSRFStrategy,
  ResponseOptions,
  BrowserXhr,
  RequestOptions
} from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import { ApiHttp, API_HTTP_PROVIDERS, apiHttpFactory } from '../../src/app/app.api-http';

describe('ApiHttp', () => {
  let apiHttp;

  const routerMock = {
    path: 'test',
    url: 'test',
    navigate(arr) {
      this.path = arr[0];
    }
  };

  beforeEach(() => {
    const backend = new XHRBackend(new BrowserXhr(),
                                   new ResponseOptions(),
                                   new CookieXSRFStrategy()),
      requestOptions = new RequestOptions();

    apiHttp = new ApiHttp(backend, requestOptions, <any>routerMock);
  });

  it('provides API_HTTP_PROVIDERS', () => {
    expect(API_HTTP_PROVIDERS).toEqual(jasmine.any(Array));
  });

  it('provides a factory method', () => {
    const actual = apiHttpFactory(null, null, null);

    expect(actual).toEqual(jasmine.any(ApiHttp));
  });

  it('should create', () => {
    expect(apiHttp).toBeTruthy();
  });

  it('has a request method', () => {
    expect(apiHttp.request('')).toEqual(jasmine.any(Observable));
  });

  it('handles the HTTP methods', () => {
    expect(apiHttp.get('')).toEqual(jasmine.any(Observable));
    expect(apiHttp.post('')).toEqual(jasmine.any(Observable));
    expect(apiHttp.put('')).toEqual(jasmine.any(Observable));
    expect(apiHttp.delete('')).toEqual(jasmine.any(Observable));
  });

  it('injects headers', () => {
    localStorage.setItem('taskboard.jwt', 'testjwt');

    const headers = apiHttp.getRequestOptionArgs().headers;

    expect(headers._headers.get('content-type')[0])
      .toEqual('application/json');
    expect(headers._headers.get('authorization')[0])
      .toEqual('testjwt');
  });

  it('intercepts observable responses', () => {
    const response = {
      json() {
        return {
          data: ['testjwt']
        };
      }
    };

    apiHttp.intercept(Observable.of(response))
      .map(response => {
        expect(localStorage.getItem('taskboard.jwt'))
          .toEqual('testjwt');
      });

    apiHttp.intercept(Observable.throw(null, <any>response))
      .catch((err, caught) => {
        expect(localStorage.getItem('taskboard.jwt'))
          .toEqual('');
      });
  });

  it('handles valid responses', () => {
    apiHttp.handleResponse({ json: () => ({ data: [ 'jwt' ]  }) });

    expect(localStorage.getItem('taskboard.jwt')).toEqual('jwt');
  });

  it('handles error responses', () => {
    var error = {
      status: 401,
      url: ''
    };

    apiHttp.handleError(error, null);

    expect(localStorage.getItem('taskboard.jwt')).toEqual(null);
  });
});

