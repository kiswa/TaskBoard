import { Component } from '@angular/core';

import { Charts } from './charts/charts.component';
import { Calendar } from './calendar/calendar.component';

@Component({
    selector: 'tb-dashboard',
    templateUrl: 'app/dashboard/dashboard.template.html',
    directives: [ Charts, Calendar ]
})
export class Dashboard {
}

