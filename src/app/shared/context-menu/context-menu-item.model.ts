export class ContextMenuItem {
    constructor(public text: string = '',
                public action: Function = null,
                public isSeparator: boolean = false,
                public canHighlight: boolean = true) {
        if (isSeparator) {
            text = '<hr>';
            canHighlight = false;
        }
    }
}

