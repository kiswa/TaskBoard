import { Component, Input } from '@angular/core';

@Component({
    selector: 'tb-calendar',
    templateUrl: 'app/dashboard/calendar/calendar.component.html'
})
export class Calendar {
    private dayLabels = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
    private monthLabels = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];

    private today: Date;
    private month: number;
    private year: number;
    private calendarDays: Array<Array<string>>;
    private tasks: Array<any>; // TODO: Use Task model when created

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

    private getColor(task: any) { // TODO: Use Task model
        return task.color;
    }

    private generateCalendar(): void {
        let firstDate = new Date(this.year, this.month, 1),
            startingDay = firstDate.getDay(),
            monthLength = new Date(this.year, this.month + 1, 0).getDate(),
            rows = Math.ceil((monthLength + startingDay) / 7),
            day = 1;

        this.calendarDays = [];

        for (let i = 0; i < rows; ++i) {
            let weekDays: Array<string> = [];

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

