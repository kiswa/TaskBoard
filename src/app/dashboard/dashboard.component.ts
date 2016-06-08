import { Component } from '@angular/core';

import { Charts } from './charts/charts.component';

@Component({
    selector: 'tb-dashboard',
    templateUrl: 'app/dashboard/dashboard.template.html',
    directives: [ Charts ]
})
export class Dashboard {
}

