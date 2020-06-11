import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { DashboardService } from './dashboard.service';
import { StringsService } from '../shared/services';

interface BurndownDates {
  start: string;
  end: string;

  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'tb-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subs: any[];

  public boards: any;
  public boardsLoading: boolean;
  public boardsMessage: string;

  public tasks: any;
  public tasksLoading: boolean;
  public tasksMessage: string;

  public strings: any;
  public pageName: string;

  public analyticsBoardId: number;
  public burndownDates: BurndownDates;
  public datesError: string;

  get showBurndown() {
    return this.burndownDates.start &&
      this.burndownDates.end && !this.datesError.length;
  }

  constructor(public title: Title,
              private service: DashboardService,
              public stringsService: StringsService) {
    this.subs = [];
    this.boardsLoading = true;
    this.tasksLoading = true;

    this.burndownDates = {
      start: null,
      end: null,
      startDate: null,
      endDate: null
    };
    this.datesError = '';

    this.subs.push(
      stringsService.stringsChanged.subscribe(newStrings => {
        this.strings = newStrings;

        title.setTitle('TaskBoard - ' + this.strings.dashboard);
        this.pageName = this.strings.dashboard;
      })
    );
  }

  ngOnInit() {
    this.service.getBoardInfo().subscribe(res => {
      this.boards = res.data[1];

      if (res.status === 'failure') {
        this.boardsMessage = res.alerts[0].text;
      }

      this.boardsLoading = false;
    });

    this.service.getTaskInfo().subscribe(res => {
      this.tasks = res.data[1];

      if (res.status === 'failure') {
        this.tasksMessage = res.alerts[0].text;
      }

      this.tasksLoading = false;
    })
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  validateDates() {
    if (this.burndownDates.start === null || this.burndownDates.end === null) {
      return;
    }
    this.datesError = '';

    this.burndownDates.startDate = new Date(this.burndownDates.start);
    this.burndownDates.endDate = new Date(this.burndownDates.end);

    const start = this.burndownDates.startDate.valueOf();
    const end = this.burndownDates.endDate.valueOf();
    const now = new Date().valueOf();

    if (start > end) {
      this.datesError = 'End date must be after start date.';
    }

    if (start > now) {
      this.datesError += ' Start date must be today or earlier.';
    }

    if (end > now) {
      this.datesError += ' End date must be today or earlier.';
    }
  }

  updateAnalytics() {

  }
}

