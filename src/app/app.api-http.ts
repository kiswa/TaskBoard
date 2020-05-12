import { Injectable } from '@angular/core';
import {
  HttpHeaderResponse,
  HttpResponseBase,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ApiResponse } from './shared/models';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private JWT_KEY = 'taskboard.jwt';

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

    const headers = (request.body instanceof FormData)
      ? { }
      : { 'Content-Type': 'application/json' };
    const token = sessionStorage.getItem(this.JWT_KEY);

    if (token !== null) {
      // tslint:disable-next-line
      headers['Authorization'] = token;
    }

    request = request.clone({
      setHeaders: headers
    });

    return next.handle(request).pipe(
      tap(evt => {
        if (evt instanceof HttpHeaderResponse ||
            !(evt instanceof HttpResponseBase)) {
          return;
        }

        const response: ApiResponse = evt.body;
        if (response.data) {
          sessionStorage.setItem(this.JWT_KEY, response.data[0]);
        }
      }, error => {
        if ((error.status === 401 || error.status === 400)) {
          sessionStorage.removeItem(this.JWT_KEY);
          this.router.navigate(['/']);
        }
      })
    );
  }

}

