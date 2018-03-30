import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { Settings } from '../../../src/app/settings/settings.component';
import { SettingsModule } from '../../../src/app/settings/settings.module';
import { SettingsService } from '../../../src/app/settings/settings.service';

describe('Settings', () => {
  let component: Settings,
    fixture: ComponentFixture<Settings>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        SettingsModule
      ],
      providers: [
        Title,
        SettingsService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sets the title when constructed', () => {
    component.strings = {
      settings: 'Settings'
    };

    expect((<any>component).title.getTitle()).toEqual('TaskBoard - Settings');
  });

});

