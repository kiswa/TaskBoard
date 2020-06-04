import { Injectable } from '@angular/core';
import { LocationStrategy } from '@angular/common';

@Injectable()
export class ApiService {
  protected apiBase: string;

  constructor(private strat: LocationStrategy) {
    this.apiBase = this.strat.getBaseHref() + 'api/';
  }
}
