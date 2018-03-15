import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'inline-edit',
  templateUrl: './inline-edit.component.html'
})
export class InlineEdit {
  public isDisplay = true;

  @Input() text: string;
  @Input() isTextarea: boolean;
  @Output() edit = new EventEmitter<string>();

  beginEdit(el: HTMLElement): void {
    this.isDisplay = false;

    setTimeout(() => { el.focus(); }, 100);
  }

  editDone(newText: string, event?: Event): void {
    this.isDisplay = true;
    this.text = newText;
    this.edit.emit(this.text);

    // Prevent Enter key from propagating to parent controls
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
  }
}

