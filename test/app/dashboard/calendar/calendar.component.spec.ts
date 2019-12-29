import { TestBed, ComponentFixture } from '@angular/core/testing';

import { CalendarComponent } from '../../../../src/app/dashboard/calendar/calendar.component';

describe('Calendar', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
      ],
      declarations: [
        CalendarComponent
      ],
      providers: [
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('can create the previous month calendar', () => {
    component.month = 0;
    component.previousMonth();

    expect(component.calendarDays).toEqual(jasmine.any(Array));
  });

  it('can create the next month calendar', () => {
    component.month = 11;
    component.nextMonth();

    expect(component.calendarDays).toEqual(jasmine.any(Array));
  });
});

