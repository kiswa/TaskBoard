import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ApiResponse } from './shared/models';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private JWT_KEY = 'taskboard.jwt';

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem(this.JWT_KEY);

    if (token !== null) {
      headers['Authorization'] = token;
    }

    request = request.clone({
      setHeaders: headers
    });

    return next.handle(request).pipe(
      tap((evt: HttpEvent<any>) => {
        if (!(evt instanceof HttpResponse)) {
          return;
        }

        const response: ApiResponse = evt.body;
        if (response.data) {
          localStorage.setItem(this.JWT_KEY, response.data[0]);
        }
      }, (err: any) => {
        if ((err instanceof HttpErrorResponse) &&
            (err.status === 401 || err.status === 400) &&
            (err.url + '').indexOf('login') === -1) {
          this.router.navigate(['']);
          localStorage.removeItem(this.JWT_KEY);
        }
      })
    );
  }

}

