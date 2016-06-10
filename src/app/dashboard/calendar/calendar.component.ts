import { Component, Input } from '@angular/core';

@Component({
    selector: 'tb-calendar',
    templateUrl: 'app/dashboard/calendar/calendar.template.html'
})
export class Calendar {
    @Input('board-id') boardId: number;

    private dayLabels = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
    private monthLabels = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];

    private month: number;
    private year: number;
    private calendarDays;

    constructor() {
        let today = new Date();

        this.month = today.getMonth();
        this.year = today.getFullYear();

        this.generateCalendar();
    }

    public previousMonth(): void {
        this.month -= 1;

        // Months are zero-index in JS
        if (this.month < 0) {
            this.year -= 1;
            this.month = 11;
        }

        this.generateCalendar();
    }

    public nextMonth(): void {
        this.month += 1;

        if (this.month > 11) {
            this.year += 1;
            this.month = 0;
        }

        this.generateCalendar();
    }

    private generateCalendar(): void {
        let firstDate = new Date(this.year, this.month, 1),
            startingDay = firstDate.getDay(),
            monthLength = new Date(this.year, this.month + 1, 0).getDate(),
            rows = Math.ceil((monthLength + startingDay) / 7),
            day = 1;

        this.calendarDays = [];

        for (let i = 0; i < rows; ++i) {
            let weekDays = [];

            for (let j = 0; j < 7; ++j) {
                if (day <= monthLength && (j >= startingDay || i > 0)) {
                    weekDays.push(day);
                    day++;
                } else {
                    weekDays.push('');
                }
            }

            this.calendarDays.push(weekDays);
        }
    }
}

