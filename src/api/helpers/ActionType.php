<?php
use MyCLabs\Enum\Enum;

class ActionType extends Enum {
  const SET_COLOR = 1;
  const SET_CATEGORY = 2;
  const ADD_CATEGORY = 3;
  const SET_ASSIGNEE = 4;
  const ADD_ASSIGNEE = 5;
  const CLEAR_DUE_DATE = 6;
  const ALTER_COLOR_BY_POINTS= 7;
}

