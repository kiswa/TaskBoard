import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiResponse } from '../shared/models';

@Injectable()
export class FileViewerService {

  constructor(private http: HttpClient) {}

  getAttachmentInfo(hash: string): Observable<ApiResponse> {
    return this.http.get('api/attachments/hash/' + hash)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

}
