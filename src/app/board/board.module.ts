import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { SharedModule } from '../shared/shared.module';

import { BoardDisplay } from './board.component';
import { ColumnDisplay } from './column/column.component';
import { TaskDisplay } from './task/task.component';
import { BoardService } from './board.service';

@NgModule({
  imports: [
    CommonModule,
    DragulaModule,
    FormsModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    BoardDisplay,
    ColumnDisplay,
    TaskDisplay
  ],
  providers: [ BoardService ],
  exports: [
    BoardDisplay,
    ColumnDisplay,
    TaskDisplay
  ]
})
export class BoardModule { }
