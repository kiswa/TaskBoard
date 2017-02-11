import {
    Component,
    Input,
    Output,
    EventEmitter
} from '@angular/core';

@Component({
    selector: 'inline-edit',
    templateUrl: 'app/shared/inline-edit/inline-edit.component.html'
})
export class InlineEdit {
    private isDisplay = true;

    @Input() text: string;
    @Output() edit = new EventEmitter<string>();

    beginEdit(el: HTMLElement): void {
        this.isDisplay = false;

        setTimeout(() => { el.focus(); }, 100);
    }

    editDone(newText: string, event: Event): void {
        this.isDisplay = true;
        this.text = newText;
        this.edit.emit(this.text);

        // Prevent Enter key from propagating to parent controls
        if (event.stopPropagation) {
            event.stopPropagation();
        }
    }
}

