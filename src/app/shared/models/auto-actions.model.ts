export enum ActionTrigger {
    MovedToColumn = 1,
    AssignedToUser,
    AddedToCategory,
    PointsChanged
}

export enum ActionType {
    SetColor = 1,
    SetCategory,
    AddCategory,
    ClearAllCategories,
    SetAssignee,
    ClearDueDate,
    AlterColorByPoints
}

export class AutoAction {
    constructor(public trigger: ActionTrigger = ActionTrigger.MovedToColumn,
                public source_id: number = null, // tslint:disable-line
                public type: ActionType = ActionType.SetColor,
                public change_to: string = null, // tslint:disable-line
                public board_id: number = null) { // tslint:disable-line
   }
}

