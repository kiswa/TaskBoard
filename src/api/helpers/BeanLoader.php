<?php
use RedBeanPHP\R;

class BeanLoader {

    public static function LoadAttachment(&$attachment, $json) {
        try {
            $data = json_decode($json);

            $attachment->filename = $data->filename;
            $attachment->name = $data->name;
            $attachment->type = $data->type;
            $attachment->user_id = $data->user_id;
            $attachment->timestamp = time();
            $attachment->task_id = $data->task_id;
        } catch (Exception $ex) {
            return false;
        }

        return true;
    }

    public static function LoadAutoAction(&$action, $json) {
        try {
            $data = json_decode($json);

            $action->trigger = $data->trigger;
            $action->source_id = $data->source_id;
            $action->type = $data->type;
            $action->change_to = $data->change_to;
            $action->board_id = $data->board_id;
        } catch (Exception $ex) {
            return false;
        }

        return true;
    }

    public static function LoadBoard(&$board, $json) {
        try {
            $data = json_decode($json);

            $board->name = $data->name;
            $board->is_active = $data->is_active;

            self::updateBoardList('category',
                                  'self::LoadCategory',
                                  $board->xownCategoryList,
                                  $data->categories);
            self::updateBoardList('column',
                                  'self::LoadColumn',
                                  $board->xownColumnList,
                                  $data->columns);
            self::updateBoardList('issuetracker',
                                  'self::LoadIssueTracker',
                                  $board->xownIssueTrackerList,
                                  $data->issue_trackers);

            // Users do not get deleted when removed from a board
            if (isset($data->users)) {
                $board->sharedUserList = [];

                foreach ($data->users as $userData) {
                    $user = R::load('user', $userData->id);

                    if ((int)$user->id > 0) {
                        $board->sharedUserList[] = $user;
                    }
                }
            }
        } catch (Exception $ex) {
            return false;
        }

        return true;
    }

    public function LoadCategory(&$category, $json) {
        try {
            $data = json_decode($json);

            $category->name = $data->name;
            $category->default_task_color = $data->default_task_color;
            $category->board_id = $data->board_id;
        } catch (Exception $ex) {
            return false;
        }

        return true;
    }

    public static function LoadColumn(&$column, $json) {
        try {
            $data = json_decode($json);

            $column->name = $data->name;
            $column->position = $data->position;
            $column->board_id = $data->board_id;
        } catch (Exception $ex) {
            return false;
        }

        return true;
    }

    public static function LoadComment(&$comment, $json) {
        try {
            $data = json_decode($json);

            $comment->text = $data->text;
            $comment->user_id = $data->user_id;
            $comment->task_id = $data->task_id;
        } catch (Exception $ex) {
            return false;
        }

        return true;
    }

    public static function LoadIssueTracker(&$tracker, $json) {
        try {
            $data = json_decode($json);

            $tracker->url = $data->url;
            $tracker->regex = $data->regex;
            $tracker->board_id = $data->board_id;
        } catch (Exception $ex) {
            return false;
        }

        return true;
    }

    public static function LoadTask(&$task, $json) {
        try {
            $data = json_decode($json);

            $task->title = $data->title;
            $task->description = $data->description;
            $task->assignee = $data->assignee;
            $task->category_id = $data->category_id;
            $task->color = $data->color;
            $task->due_date = $data->due_date;
            $task->points = $data->points;
            $task->position = $data->position;
            $task->column_id = $data->column_id;
        } catch (Exception $ex) {
            return false;
        }

        return true;
    }

    public static function LoadUser(&$user, $json) {
        try {
            $data = json_decode($json);

            $user->security_level = $data->security_level;
            $user->username = $data->username;
            $user->email = $data->email;
            $user->default_board_id = $data->default_board_id;
            $user->user_option_id = $data->user_option_id;
            $user->last_login = $data->last_login;
            $user->password_hash = $data->password_hash;
        } catch (Exception $ex) {
            return false;
        }

        return true;
    }

    public static function LoadUserOption(&$opts, $json) {
        try {
            $data = json_decode($json);

            $opts->new_tasks_at_bottom = (boolean)$data->new_tasks_at_bottom;
            $opts->show_animations = (boolean)$data->show_animations;
            $opts->show_assignee = (boolean)$data->show_assignee;
            $opts->multiple_tasks_per_row = (boolean)$data->multiple_tasks_per_row;
        } catch (Exception $ex) {
            return false;
        }

        return true;
    }

    private static function removeObjectsNotInData($type, &$dataList, &$boardList) {
        $dataIds = [];

        foreach ($dataList as $data) {
            if (isset($data->id)) {
                $dataIds[] = (int)$data->id;
            }
        }

        foreach ($boardList as $existing) {
            if (!in_array((int)$existing->id, $dataIds)) {
                $remove = R::load($type, $existing->id);
                R::trash($remove);
            }
        }
    }

    private static function loadObjectsFromData($type, $loadFunc, &$dataList,
                                                &$boardList) {
        foreach ($dataList as $obj) {
            $object = R::load($type, (isset($obj->id) ? $obj->id : 0));

            if ((int)$object->id === 0) {
                call_user_func_array($loadFunc, array(&$object,
                                                      json_encode($obj)));
                $boardList[] = $object;
                continue;
            }

            call_user_func_array($loadFunc, array(&$boardList[$object->id],
                                                  json_encode($obj)));
        }
    }

    private static function updateBoardList($type, $loadFunc,
                                            &$boardList = [], &$dataList = []) {
        if (count($boardList) && count($dataList)) {
            self::removeObjectsNotInData($type, $dataList, $boardList);
        }

        if (count($dataList)) {
            self::loadObjectsFromData($type, $loadFunc, $dataList, $boardList);
        }

        // Remove all objects from existing boardlist when none in datalist
        if (!count($dataList) && count($boardList)) {
            foreach ($boardList as $obj) {
                R::trash($obj);
            }
        }
    }

}

