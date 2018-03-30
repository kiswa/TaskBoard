import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Title } from '@angular/platform-browser';

import { Charts } from '../../../../src/app/dashboard/charts/charts.component';
import { DashboardModule } from '../../../../src/app/dashboard/dashboard.module';

describe('Charts', () => {
  let component: Charts,
    fixture: ComponentFixture<Charts>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        DashboardModule
      ],
      providers: [
        Title
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Charts);
    component = fixture.componentInstance;
  });

  it('can be constructed', () => {
    expect(component).toBeTruthy();
  });

  it('implements AfterViewInit', () => {
    component.series = '1,2,3';
    component.labels = 'test,test,test';
    component.chartName = 'Test';

    const div = document.createElement('div');

    div.id = 'Test';
    document.body.appendChild(div);

    component.ngAfterViewInit();

    component.chartType = 'line';
    component.ngAfterViewInit();

    expect(component.words.length).toEqual(3);
    expect(component.data.length).toEqual(3);
  });
});

