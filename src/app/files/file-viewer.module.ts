import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { FileViewerComponent } from './file-viewer.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    FileViewerComponent
  ],
  exports: [
    FileViewerComponent
  ]
})
export class FileModule {  }
