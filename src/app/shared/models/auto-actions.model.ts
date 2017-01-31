export enum ActionTrigger {
    MoveToColumn = 1,
    AssignedToUser,
    SetToCategory,
    PointsChanged
}

export enum ActionType {
    SetColor = 1,
    SetCategory,
    SetAssignee,
    ClearDueDate,
    UseBaseColor
}

export class AutoAction {
    constructor(public trigger: ActionTrigger,
               public source_id: number, // tslint:disable-line
               public type: ActionType,
               public change_to: string, // tslint:disable-line
               public board_id: number) { // tslint:disable-line
   }
}

