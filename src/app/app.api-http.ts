import { provide } from '@angular/core';
import {
    Http,
    Request,
    RequestOptionsArgs,
    Response,
    XHRBackend,
    RequestOptions,
    ConnectionBackend,
    Headers
} from '@angular/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import { ApiResponse } from './shared/index';

export const API_HTTP_PROVIDERS = [
    provide(Http, {
        useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions,
            router: Router) => new ApiHttp(xhrBackend, requestOptions, router),
        deps: [XHRBackend, RequestOptions, Router]
    })
];

export class ApiHttp extends Http {
    private JWT_KEY = 'taskboard.jwt';

    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions,
            private router: Router) {
        super(backend, defaultOptions);
    }

    request(url: string | Request,
            options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.request(url,
            this.getRequestOptionArgs(options)));
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.get(url,
            this.getRequestOptionArgs(options)));
    }

    post(url: string, body: string,
            options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.post(url, body,
            this.getRequestOptionArgs(options)));
    }

    put(url: string, body: string,
            options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.put(url, body,
            this.getRequestOptionArgs(options)));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.delete(url,
            this.getRequestOptionArgs(options)));
    }

    getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }

        if (options.headers == null) {
            options.headers = new Headers();
        }

        options.headers.append('Content-Type', 'application/json');

        let jwt = localStorage.getItem(this.JWT_KEY);
        if (jwt) {
            options.headers.append('Authorization', jwt);
        }

        return options;
    }

    intercept(observable: Observable<Response>): Observable<Response> {
        return observable
            .map((res: Response) => {
                let response: ApiResponse = res.json();
                localStorage.setItem(this.JWT_KEY, response.data[0]);

                return res;
            })
            .catch((err, source) => {
                if (err.status === 401 && err.url.indexOf('login') === -1) {
                    this.router.navigate(['']);
                    localStorage.removeItem(this.JWT_KEY);
                }

                return Observable.throw(err);
            });
    }
}

