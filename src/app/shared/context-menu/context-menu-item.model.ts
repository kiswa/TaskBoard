export class ContextMenuItem {
  constructor(public text: string = '',
              public action: Function = null,
              public isSeparator: boolean = false,
              public canHighlight: boolean = true,
              public isCustom: boolean = false) {
    if (isSeparator) {
      this.text = '<hr>';
      this.canHighlight = false;
    }

    if (!isCustom) {
      this.text = '<span (click)="action($event)">' + this.text +
        '</span>';
    }
  }
}

