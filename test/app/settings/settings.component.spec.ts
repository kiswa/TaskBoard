import { TestBed, ComponentFixture } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { DragulaService } from 'ng2-dragula';

import { Settings } from '../../../src/app/settings/settings.component';
import { SettingsModule } from '../../../src/app/settings/settings.module';
import { SettingsService } from '../../../src/app/settings/settings.service';
import { StringsService } from '../../../src/app/shared/services';

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
        DragulaService,
        SettingsService,
        {
          provide: StringsService,
          useValue: {
            stringsChanged: {
              subscribe: fn => {
                fn({ settings: 'Settings' });
                return { unsubscribe: () => {} };
              }
            }
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sets the title when constructed', () => {
    expect((<any>component).title.getTitle()).toEqual('TaskBoard - Settings');
  });

});
