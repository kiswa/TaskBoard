import { Injectable } from '@angular/core';

@Injectable()
export class Constants {
  public get VERSION(): string { return '1.0.2'; }
  public get TOKEN(): string { return 'taskboard.jwt'; }
}

