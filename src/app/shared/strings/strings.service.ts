import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/finally';

@Injectable()
export class StringsService {
  private strings = new BehaviorSubject<any>({});

  public stringsChanged = this.strings.asObservable();

  constructor(private http: HttpClient) {
  }

  loadStrings(language: string): void {
    this.http.get('strings/' + language + '.json')
    .subscribe((res: any) => {
      this.strings.next(res);
    });
  }
}

