import { Component, Input, AfterViewInit } from '@angular/core';
import * as Chartist from 'chartist';

@Component({
  selector: 'tb-charts',
  templateUrl: './charts.component.html'
})
export class Charts implements AfterViewInit {
  public percentages: Array<number>;
  public data: Array<number>;
  public words: Array<string>;

  @Input('chart-name') chartName = '';
  @Input('chart-type') chartType = 'pie';
  @Input('series') series = '';
  @Input('labels') labels = '';
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
    let data = {
      series: this.data,
      labels: this.words
    },
      options = {
        donut: true,
        donutWidth: 100,
        labelInterpolationFnc: (label: string, index: number) => {
          let value = this.data[index],
            percent = Math.round(value /
              this.data.reduce(Chartist.sum) * 100);

          if (this.percentages.length < this.data.length) {
            this.percentages.push(percent);
          }

          return label + ' ' + percent + '%';
        }
      },
      pie = new Chartist.Pie('#' + this.chartName, data, options);
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
        height: '300px'// ,
        // plugins: [ Chartist.plugins.tooltip({
        //     transformTooltipTextFnc: (value) => {
        //         return value + ' points remaining'
        //     }
        // }) ]
      },
      line = new Chartist.Line('#' + this.chartName, data, options);
  }

  private convertToNumberArray(arr: Array<string>): Array<number> {
    let nums: Array<number> = [];

    for (let i = 0, len = arr.length; i < len; ++i) {
      nums.push(Number(arr[i]));
    }

    return nums;
  }
}

