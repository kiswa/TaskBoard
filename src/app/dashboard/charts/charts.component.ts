import { Component, Input, AfterViewInit } from '@angular/core';
import * as Chartist from 'chartist';

@Component({
  selector: 'tb-charts',
  templateUrl: './charts.component.html'
})
export class ChartsComponent implements AfterViewInit {
  public percentages: Array<number>;
  public data: Array<number>;
  public words: Array<string>;

  // tslint:disable-next-line
  @Input('chart-name') chartName = '';
  // tslint:disable-next-line
  @Input('chart-type') chartType = 'pie';
  // tslint:disable-next-line
  @Input('series') series = '';
  // tslint:disable-next-line
  @Input('labels') labels = '';
  // tslint:disable-next-line
  @Input('table-head') tableHead = '';

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
    const data = {
      series: this.data,
      labels: this.words
    };
    const options = {
      donut: true,
      donutWidth: 100,
      labelInterpolationFnc: (label: string, index: number) => {
        const value = this.data[index];
        const percent = Math.round(value /
          this.data.reduce(Chartist.sum) * 100);

        if (this.percentages.length < this.data.length) {
          this.percentages.push(percent);
        }

        return label + ' ' + percent + '%';
      }
    };

    // tslint:disable-next-line
    new Chartist.Pie('#' + this.chartName, data, options);
  }

  private createLineChart() {
    const data = {
      series: [this.data],
      labels: this.words
    };
    const options = {
      axisY: {
        onlyInteger: true
      },
      low: 0,
      height: '300px'// ,
      // plugins: [ Chartist.plugins.tooltip({
      //     transformTooltipTextFnc: (value) => {
      //         return value + ' points remaining'
      //     }
      // }) ]
    };

    // tslint:disable-next-line
    new Chartist.Line('#' + this.chartName, data, options);
  }

  private convertToNumberArray(arr: Array<string>): Array<number> {
    const nums: Array<number> = [];

    for (let i = 0, len = arr.length; i < len; ++i) {
      nums.push(Number(arr[i]));
    }

    return nums;
  }
}

