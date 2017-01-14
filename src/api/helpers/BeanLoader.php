<?php
use RedBeanPHP\R;

class BeanLoader {

    public static function LoadAttachment(&$attachment, $json) {
        $data = json_decode($json);
        $loaded = true;

        if (isset($data->filename)) {
            $attachment->filename = $data->filename;
        } else {
            $loaded = false;
        }

        if (isset($data->name)) {
            $attachment->name = $data->name;
        } else {
            $loaded = false;
        }

        if (isset($data->type)) {
            $attachment->type = $data->type;
        } else {
            $loaded = false;
        }

        if (isset($data->user_id)) {
            $attachment->user_id = $data->user_id;
        } else {
            $loaded = false;
        }

        $attachment->timestamp = time();

        if (isset($data->task_id)) {
            $attachment->task_id = $data->task_id;
        } else {
            $loaded = false;
        }

        return $loaded;
    }

    public static function LoadAutoAction(&$action, $json) {
        $data = json_decode($json);
        $loaded = true;

        if (isset($data->trigger)) {
            $action->trigger = $data->trigger;
        } else {
            $loaded = false;
        }

        if (isset($data->source_id)) {
            $action->source_id = $data->source_id;
        } else {
            $loaded = false;
        }

        if (isset($data->type)) {
            $action->type = $data->type;
        } else {
            $loaded = false;
        }

        if (isset($data->change_to)) {
            $action->change_to = $data->change_to;
        } else {
            $loaded = false;
        }

        if (isset($data->board_id)) {
            $action->board_id = $data->board_id;
        } else {
            $loaded = false;
        }

        return $loaded;
    }

    public static function LoadBoard(&$board, $json) {
        $data = json_decode($json);
        $loaded = true;

        if (isset($data->name)) {
            $board->name = $data->name;
        } else {
            $loaded = false;
        }

        if (isset($data->is_active)) {
            $board->is_active = $data->is_active;
        } else {
            $loaded = false;
        }

        if (isset($data->categories)) {
            self::updateBoardList('category', 'LoadCategory',
                                  $board->xownCategoryList, $data->categories);
        } else {
            $loaded = false;
        }

        if (isset($data->columns)) {
            self::updateBoardList('column', 'LoadColumn',
                                  $board->xownColumnList, $data->columns);
        } else {
            $loaded = false;
        }

        if (isset($data->issue_trackers)) {
            self::updateBoardList('issuetracker', 'LoadIssueTracker',
                                  $board->xownIssueTrackerList,
                                  $data->issue_trackers);
        } else {
            $loaded = false;
        }

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

        return $loaded;
    }

    public function LoadCategory(&$category, $json) {
        $data = json_decode($json);
        $loaded = true;

        if (isset($data->name)) {
            $category->name = $data->name;
        } else {
            $loaded = false;
        }

        if (isset($data->default_task_color)) {
            $category->default_task_color = $data->default_task_color;
        } else {
            $loaded = false;
        }

        if (isset($data->board_id)) {
            $category->board_id = $data->board_id;
        } else {
            $loaded = false;
        }

        return $loaded;
    }

    public static function LoadColumn(&$column, $json) {
        $data = json_decode($json);
        $loaded = true;

        if (isset($data->name)) {
            $column->name = $data->name;
        } else {
            $loaded = false;
        }

        if (isset($data->position)) {
            $column->position = $data->position;
        } else {
            $loaded = false;
        }

        if (isset($data->board_id)) {
            $column->board_id = $data->board_id;
        } else {
            $loaded = false;
        }

        return $loaded;
    }

    public static function LoadComment(&$comment, $json) {
        $data = json_decode($json);
        $loaded = true;

        if (isset($data->text)) {
            $comment->text = $data->text;
        } else {
            $loaded = false;
        }

        if (isset($data->user_id)) {
            $comment->user_id = $data->user_id;
        } else {
            $loaded = false;
        }

        if (isset($data->task_id)) {
            $comment->task_id = $data->task_id;
        } else {
            $loaded = false;
        }

        return $loaded;
    }

    public static function LoadIssueTracker(&$tracker, $json) {
        $data = json_decode($json);
        $loaded = true;

        if (isset($data->url)) {
            $tracker->url = $data->url;
        } else {
            $loaded = false;
        }

        if (isset($data->regex)){
            $tracker->regex = $data->regex;
        } else {
            $loaded = false;
        }

        if (isset($data->board_id)) {
            $tracker->board_id = $data->board_id;
        } else {
            $loaded = false;
        }

        return $loaded;
    }

    public static function LoadTask(&$task, $json) {
        $data = json_decode($json);
        $loaded = true;

        if (isset($data->title)) {
            $task->title = $data->title;
        } else {
            $loaded = false;
        }

        if (isset($data->description)) {
            $task->description = $data->description;
        }

        if (isset($data->assignee)) {
            $task->assignee = $data->assignee;
        }

        if (isset($data->category_id)) {
            $task->category_id = $data->category_id;
        }

        if (isset($data->color)) {
            $task->color = $data->color;
        }

        if (isset($data->due_date)) {
            $task->due_date = $data->due_date;
        }

        if (isset($data->points)) {
            $task->points = $data->points;
        }

        if (isset($data->position)) {
            $task->position = $data->position;
        } else {
            $loaded = false;
        }

        if (isset($data->column_id)) {
            $task->column_id = $data->column_id;
        } else {
            $loaded = false;
        }

        return $loaded;
    }

    public static function LoadUser(&$user, $json) {
        $data = json_decode($json);
        $loaded = true;

        if (isset($data->security_level)) {
            $user->security_level = $data->security_level;
        } else {
            $loaded = false;
        }

        if (isset($data->username)) {
            $user->username = $data->username;
        } else {
            $loaded = false;
        }

        if (isset($data->email)) {
            $user->email = $data->email;
        }

        if (isset($data->default_board_id)) {
            $user->default_board_id = $data->default_board_id;
        }

        if (isset($data->user_option_id)) {
            $user->user_option_id = $data->user_option_id;
        }

        if (isset($data->last_login)) {
            $user->last_login = $data->last_login;
        }

        if (isset($data->password_hash)) {
            $user->password_hash = $data->password_hash;
        }

        return $loaded;
    }

    public static function LoadUserOption(&$opts, $json) {
        $data = json_decode($json);
        $loaded = true;

        if (isset($data->new_tasks_at_bottom)) {
            $opts->new_tasks_at_bottom = (boolean)$data->new_tasks_at_bottom;
        } else {
            $loaded = false;
        }

        if (isset($data->show_animations)) {
            $opts->show_animations = (boolean)$data->show_animations;
        } else {
            $loaded = false;
        }

        if (isset($data->show_assignee)) {
            $opts->show_assignee = (boolean)$data->show_assignee;
        } else {
            $loaded = false;
        }

        if (isset($data->multiple_tasks_per_row)) {
            $opts->multiple_tasks_per_row = (boolean)$data->multiple_tasks_per_row;
        } else {
            $loaded = false;
        }

        return $loaded;
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
                call_user_func_array(array(__CLASS__, $loadFunc),
                                     array(&$object, json_encode($obj)));
                $boardList[] = $object;
                continue;
            }

            call_user_func_array(array(__CLASS__, $loadFunc),
                                 array(&$boardList[$object->id],
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

