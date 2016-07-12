import { Component, Input, AfterViewInit } from '@angular/core';

@Component({
    selector: 'tb-charts',
    templateUrl: 'app/dashboard/charts/charts.component.html'
})
export class Charts implements AfterViewInit {
    @Input('chart-name') chartName: string;
    @Input('chart-type') chartType: string = 'pie';
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

        if (this.chartType === 'line') {
            this.createLineChart();
        } else {
            this.createPieChart();
        }
    }

    private createPieChart() {
        let data = {
            series: this.data,
            labels: this.words
        },
        options = {
            donut: true,
            donutWidth: 100,
            labelInterpolationFnc: (label, index) => {
                let value = this.data[index],
                    percent = Math.round(value /
                        this.data.reduce(Chartist.sum) * 100);

                if (this.percentages.length < this.data.length) {
                    this.percentages.push(percent);
                }

                return label + ' ' + percent + '%';
            }
        };

        new Chartist.Pie('#' + this.chartName, data, options)
    }

    private createLineChart() {
        let data = {
            series: [this.data],
            labels: this.words
        },
        options = {
            axisY: {
                onlyInteger: true
            },
            low: 0,
            height: '300px',
            plugins: [ Chartist.plugins.tooltip({
                transformTooltipTextFnc: (value) => {
                    return value + ' points remaining'
                }
            }) ]
        };

        new Chartist.Line('#' + this.chartName, data, options);
    }

    private convertToNumberArray(arr: string[]): number[] {
        let nums = [];

        for (let i = 0, len = arr.length; i < len; ++i) {
            nums.push(Number(arr[i]));
        }

        return nums;
    }
}

