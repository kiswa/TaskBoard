import { Component, Input, AfterViewInit } from '@angular/core';

@Component({
    selector: 'tb-charts',
    template: '<div id="{{ chartName }}" class="ct-chart ct-golden-section"></div>'
})
export class Charts implements AfterViewInit {
    @Input('chart-name') chartName: string;
    @Input('series') series: string;
    @Input('labels') labels: string;

    ngAfterViewInit() {
        let data = {
            series: this.convertToNumberArray(this.series.split(',')),
            labels: this.labels.split(',')
        },
        options = {
            donut: true,
            donutWidth: 150,
            labelInterpolationFnc: function(label, index) {
                let value = data.series[index];

                return label + ' ' + Math.round(value /
                    data.series.reduce(Chartist.sum) * 100) + '%';
            }
        };

        new Chartist.Pie('#' + this.chartName, data, options)
    }

    private convertToNumberArray(arr: string[]): number[] {
        let nums = [];

        for (let i = 0, len = arr.length; i < len; ++i) {
            nums.push(Number(arr[i]));
        }

        return nums;
    }
}

