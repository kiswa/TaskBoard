import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import { enableProdMode } from '@angular/core';

import { AppModule } from './app.module';

// enableProdMode();

platformBrowserDynamic().bootstrapModule(AppModule);

