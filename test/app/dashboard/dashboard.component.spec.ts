import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Title } from '@angular/platform-browser';

import { DashboardComponent } from 'src/app/dashboard/dashboard.component';
import { DashboardModule } from 'src/app/dashboard/dashboard.module';

describe('DashBoard', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

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

  it('can be constructed', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});

