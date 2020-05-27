import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { FileViewerComponent } from './file-viewer.component';
import { FileViewerService } from './file-viewer.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    FileViewerComponent
  ],
  providers: [
    FileViewerService
  ],
  exports: [
    FileViewerComponent
  ]
})
export class FileModule {  }
