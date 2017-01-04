<?php
use MyCLabs\Enum\Enum;

class ActionType extends Enum {
    const SET_COLOR = 1;
    const SET_CATEGORY = 2;
    const SET_ASSIGNEE = 3;
    const CLEAR_DUE_DATE = 4;
    const USE_BASE_COLOR = 5;
}

