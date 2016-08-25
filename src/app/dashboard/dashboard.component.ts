import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TopNav } from '../shared/index';
import { Charts } from './charts/charts.component';
import { Calendar } from './calendar/calendar.component';

@Component({
    selector: 'tb-dashboard',
    templateUrl: 'app/dashboard/dashboard.component.html',
    directives: [ TopNav, Charts, Calendar ]
})
export class Dashboard {
    constructor(private title: Title) {
        title.setTitle('TaskBoard - Dashboard');
    }
}

