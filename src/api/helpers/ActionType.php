<?php
use MyCLabs\Enum\Enum;

class ActionType extends Enum {
    const SET_COLOR = 1;
    const SET_CATEGORY = 2;
    const ADD_CATEGORY = 3;
    const CLEAR_ALL_CATEGORIES = 4;
    const SET_ASSIGNEE = 5;
    const ADD_ASSIGNEE = 6;
    const CLEAR_DUE_DATE = 7;
    const ALTER_COLOR_BY_POINTS= 8;
}

