import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { SettingsComponent } from 'src/app/settings/settings.component';
import { SettingsModule } from 'src/app/settings/settings.module';
import { SettingsService } from 'src/app/settings/settings.service';
import { StringsService } from 'src/app/shared/services';

describe('Settings', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

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
        SettingsService,
        {
          provide: StringsService,
          useValue: {
            stringsChanged: {
              subscribe: (fn: any) => {
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
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sets the title when constructed', () => {
    expect((component as any).title.getTitle()).toEqual('TaskBoard - Settings');
  });

});
