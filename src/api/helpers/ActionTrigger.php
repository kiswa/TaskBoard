<?php
use MyCLabs\Enum\Enum;

class ActionTrigger extends Enum {
    const MOVE_TO_COLUMN = 1;
    const ASSIGNED_TO_USER = 2;
    const SET_TO_CATEGORY = 3;
    const POINTS_CHANGED = 4;
}

