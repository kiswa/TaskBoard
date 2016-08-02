var chai = require('chai'),
    expect = chai.expect,
    path = '../../../../build/dashboard/calendar/',
    Calendar = require(path + 'calendar.component.js').Calendar;

describe('Calendar', () => {
    var calendar;

    beforeEach(() => {
        calendar = new Calendar();
    });

    it('generates a calendar', () => {
        calendar.generateCalendar();

        expect(calendar.calendarDays).to.be.an('array');
    });

    it('can create the previous month calendar', () => {
        calendar.month = 0;
        calendar.previousMonth();

        expect(calendar.calendarDays).to.be.an('array');
    });

    it('can create the next month calendar', () => {
        calendar.month = 11;
        calendar.nextMonth();

        expect(calendar.calendarDays).to.be.an('array');
    });
});

