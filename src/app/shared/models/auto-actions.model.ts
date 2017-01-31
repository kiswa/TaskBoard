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
    constructor(public trigger: ActionTrigger = ActionTrigger.MoveToColumn,
                public source_id: number = null, // tslint:disable-line
                public type: ActionType = ActionType.SetColor,
                public change_to: string = null, // tslint:disable-line
                public board_id: number = null) { // tslint:disable-line
   }
}

