import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
    ApiResponse
} from '../../shared/index';

@Injectable()
export class AutoActionsService {
    constructor(private http: Http) {
    }
}

