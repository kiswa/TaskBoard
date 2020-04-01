import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { SharedModule } from '../shared/shared.module';

import { BoardDisplayComponent } from './board.component';
import { ColumnDisplayComponent } from './column/column.component';
import { TaskDisplayComponent } from './task/task.component';
import { BoardService } from './board.service';

@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    BoardDisplayComponent,
    ColumnDisplayComponent,
    TaskDisplayComponent
  ],
  providers: [ BoardService ],
  exports: [
    BoardDisplayComponent,
    ColumnDisplayComponent,
    TaskDisplayComponent,
  ]
})
export class BoardModule { }
