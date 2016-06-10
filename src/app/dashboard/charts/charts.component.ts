import { Component, Input, AfterViewInit } from '@angular/core';

@Component({
    selector: 'tb-charts',
    templateUrl: 'app/dashboard/charts/charts.template.html'
})
export class Charts implements AfterViewInit {
    @Input('chart-name') chartName: string;
    @Input('series') series: string;
    @Input('labels') labels: string;
    @Input('table-head') tableHead: string;

    private percentages: number[];
    private data: number[];
    private words: string[];

    constructor() {
        this.percentages = [];
        this.data = [];
        this.words = [];
    }

    ngAfterViewInit() {
        this.data = this.convertToNumberArray(this.series.split(','));
        this.words = this.labels.split(',');

        let data = {
            series: this.data,
            labels: this.words
        },
        options = {
            donut: true,
            donutWidth: 100,
            labelInterpolationFnc: (label, index) => {
                let value = data.series[index],
                    percent = Math.round(value /
                        data.series.reduce(Chartist.sum) * 100);

                if (this.percentages.length < this.data.length) {
                    this.percentages.push(percent);
                }

                return label + ' ' + percent + '%';
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

