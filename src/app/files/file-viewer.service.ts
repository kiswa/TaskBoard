import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiResponse } from '../shared/models';
import { ApiService } from '../shared/services';

@Injectable()
export class FileViewerService extends ApiService {

  constructor(private http: HttpClient, strat: LocationStrategy) {
    super(strat);
  }

  getAttachmentInfo(hash: string): Observable<ApiResponse> {
    return this.http.get(this.apiBase +'attachments/hash/' + hash)
    .pipe(
      map((response: ApiResponse) => response),
      catchError((err) => of(err.error as ApiResponse))
    );
  }

}
