<?php
use RedBeanPHP\R;

class BeanLoader {

    public static function LoadAttachment(&$attachment, $json) {
        $data = json_decode($json);

        $attachment->filename = isset($data->filename) ? $data->filename : '';
        $attachment->name = isset($data->name) ? $data->name : '';
        $attachment->type = isset($data->type) ? $data->type : '';
        $attachment->user_id = isset($data->user_id) ? $data->user_id : '';
        $attachment->timestamp = time();
        $attachment->task_id = isset($data->task_id) ? $data->task_id : '';

        if (!isset($data->filename) || !isset($data->name) ||
            !isset($data->type) || !isset($data->user_id) ||
            !isset($data->task_id)) {
            return false;
        }

        return true;
    }

    public static function LoadAutoAction(&$action, $json) {
        $data = json_decode($json);

        $action->trigger = isset($data->trigger) ? $data->trigger : '';
        $action->source_id = isset($data->source_id) ? $data->source_id: '';
        $action->type = isset($data->type) ? $data->type : '';
        $action->change_to = isset($data->change_to) ? $data->change_to: '';
        $action->board_id = isset($data->board_id) ? $data->board_id: '';

        if (!isset($data->trigger) || !isset($data->source_id) ||
            !isset($data->type) || !isset($data->change_to) ||
            !isset($data->board_id)) {
            return false;
        }

        return true;
    }

    public static function LoadBoard(&$board, $json) {
        $data = json_decode($json);

        $board->name = isset($data->name) ? $data->name : '';
        $board->is_active = isset($data->is_active) ? $data->is_active : '';

        if (isset($data->categories)) {
            self::updateBoardList('category', 'LoadCategory',
                $board->xownCategoryList, $data->categories);
        }

        if (isset($data->columns)) {
            self::updateBoardList('column', 'LoadColumn',
                $board->xownColumnList, $data->columns);
        }

        if (isset($data->issue_trackers)) {
            self::updateBoardList('issuetracker', 'LoadIssueTracker',
                $board->xownIssueTrackerList,
                $data->issue_trackers);
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

        if (!isset($data->name) || !isset($data->is_active) ||
            !isset($data->categories) || !isset($data->columns) ||
            !isset($data->issue_trackers) || !isset($data->users)) {
            return false;
        }

        return true;
    }

    public static function LoadCategory(&$category, $json) {
        $data = json_decode($json);

        $category->name = isset($data->name) ? $data->name : '';
        $category->default_task_color = isset($data->default_task_color)
            ? $data->default_task_color : '';
        $category->board_id = isset($data->board_id) ? $data->board_id : '';

        if (!isset($data->name) || !isset($data->default_task_color) ||
            !isset($data->board_id)) {
            return false;
        }

        return true;
    }

    public static function LoadColumn(&$column, $json) {
        $data = json_decode($json);

        $column->name = isset($data->name) ? $data->name : '';
        $column->position = isset($data->position) ? $data->position : '';
        $column->board_id = isset($data->board_id) ? $data->board_id : '';

        if (!isset($data->name) || !isset($data->position) ||
            !isset($data->board_id)) {
            return false;
        }

        return true;
    }

    public static function LoadComment(&$comment, $json) {
        $data = json_decode($json);

        $comment->text = isset($data->text) ? $data->text : '';
        $comment->user_id = isset($data->user_id) ? $data->user_id : '';
        $comment->task_id = isset($data->task_id) ? $data->task_id : '';

        if (!isset($data->text) || !isset($data->user_id) ||
            !isset($data->task_id)) {
            return false;
        }

        return true;
    }

    public static function LoadIssueTracker(&$tracker, $json) {
        $data = json_decode($json);

        $tracker->url = isset($data->url) ? $data->url : '';
        $tracker->regex = isset($data->regex) ? $data->regex : '';
        $tracker->board_id = isset($data->board_id) ? $data->board_id : '';

        if (!isset($data->url) || !isset($data->regex) ||
            !isset($data->board_id)) {
            return false;
        }

        return true;
    }

    public static function LoadTask(&$task, $json) {
        $data = json_decode($json);

        $task->title = isset($data->title) ? $data->title : '';
        $task->description = isset($data->description)
            ? $data->description : '';
        $task->assignee = isset($data->assignee) ? $data->assignee : '';
        $task->category_id = isset($data->category_id)
            ? $data->category_id : '';
        $task->color = isset($data->color) ? $data->color : '';
        $task->due_date = isset($data->due_date) ? $data->due_date : '';
        $task->points = isset($data->points) ? $data->points : '';
        $task->position = isset($data->position) ? $data->position : '';
        $task->column_id = isset($data->column_id) ? $data->column_id : '';

        if (!isset($data->title) || !isset($data->description) ||
            !isset($data->position) || !isset($data->column_id)) {
            return false;
        }

        return true;
    }

    public static function LoadUser(&$user, $json) {
        $data = json_decode($json);

        $user->security_level = isset($data->security_level)
            ? $data->security_level : '';
        $user->username = isset($data->username) ? $data->username : '';
        $user->email = isset($data->email) ? $data->email : '';
        $user->default_board_id = isset($data->default_board_id)
            ? $data->default_board_id : '';
        $user->user_option_id = isset($data->user_option_id)
            ? $data->user_option_id : '';
        $user->last_login = isset($data->last_login) ? $data->last_login : '';
        $user->password_hash = isset($data->password_hash)
            ? $data->password_hash : '';

        if (!isset($data->security_level) || !isset($data->username)) {
            return false;
        }

        return true;
    }

    public static function LoadUserOption(&$opts, $json) {
        $data = json_decode($json);

        $opts->new_tasks_at_bottom = (boolean)$data->new_tasks_at_bottom;
        $opts->show_animations = (boolean)$data->show_animations;
        $opts->show_assignee = (boolean)$data->show_assignee;
        $opts->multiple_tasks_per_row = (boolean)$data->multiple_tasks_per_row;

        if (!isset($data->new_tasks_at_bottom) ||
            !isset($data->show_animations) || !isset($data->show_assignee) ||
            !isset($data->multiple_tasks_per_row)) {
            return false;
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

