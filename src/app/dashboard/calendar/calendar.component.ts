import { Component, Input } from '@angular/core';

/* istanbul ignore next */
@Component({
  selector: 'tb-calendar',
  templateUrl: './calendar.component.html'
})
export class CalendarComponent {
  public today: Date;
  public tasks: any[]; // TODO: Use Task model when created

  public dayLabels = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
  public monthLabels = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  public month: number;
  public year: number;
  public calendarDays: string[][];

  // tslint:disable-next-line
  @Input('board-id') boardId: number;

  constructor() {
    this.today = new Date();

    this.month = this.today.getMonth();
    this.year = this.today.getFullYear();

    this.tasks = [];
    this.tasks[22] = [
      {
        title: 'Some work that must get done',
        points: 5,
        color: '#bee7f4'
      },
      {
        title: 'Another thing to do',
        points: 3,
        color: '#debee8'
      },
      {
        title: 'Testing a date with multiple tasks',
        points: 8,
        color: '#ffffe0'
      }
    ];

    this.generateCalendar();
  }

  previousMonth(): void {
    this.month -= 1;

    // Months are zero-index in JS
    if (this.month < 0) {
      this.year -= 1;
      this.month = 11;
    }

    this.generateCalendar();
  }

  nextMonth(): void {
    this.month += 1;

    if (this.month > 11) {
      this.year += 1;
      this.month = 0;
    }

    this.generateCalendar();
  }

  getColor(task: any) { // TODO: Use Task model
    return task.color;
  }

  private generateCalendar(): void {
    const firstDate = new Date(this.year, this.month, 1);
    const startingDay = firstDate.getDay();
    const monthLength = new Date(this.year, this.month + 1, 0).getDate();
    const rows = Math.ceil((monthLength + startingDay) / 7);
    let day = 1;

    this.calendarDays = [];

    for (let i = 0; i < rows; ++i) {
      const weekDays: Array<string> = [];

      for (let j = 0; j < 7; ++j) {
        if (day <= monthLength && (j >= startingDay || i > 0)) {
          weekDays.push('' + day);
          day++;
        } else {
          weekDays.push('');
        }
      }

      this.calendarDays.push(weekDays);
    }
  }
}

