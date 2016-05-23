<?php

class AppMock {

    public function getContainer() {
        return new ContainerMock();
    }

}

$app = new AppMock();

class DataMock {
    public static function getBoard() {
        $board = new stdClass();
        $board->id = 1;
        $board->name = 'test';
        $board->is_active = true;
        $board->columns[] = DataMock::getColumn();
        $board->categories[] = DataMock::getCategory();
        $board->auto_actions[] = DataMock::getAutoAction();
        $board->users[] = DataMock::getUser();

        return $board;
    }

    public static function getColumn() {
        $column = new stdClass();
        $column->id = 1;
        $column->name = 'col1';
        $column->position = 1;
        $column->tasks[] = DataMock::getTask();

        return $column;
    }

    public static function getCategory() {
        $category = new stdClass();
        $category->id = 1;
        $category->name = 'cat1';

        return $category;
    }

    public static function getAutoAction() {
        $auto_action = new stdClass();
        $auto_action->id = 1;
        $auto_action->trigger = ActionTrigger::SetToCategory;
        $auto_action->source_id = 1;
        $auto_action->type = ActionType::ClearDueDate;
        $auto_action->change_to = 'null';

        return $auto_action;
    }

    public static function getUser() {
        $user = new stdClass();
        $user->id = 1;
        $user->security_level = SecurityLevel::BoardAdmin;
        $user->username = 'tester';
        $user->password_hash = 'hashpass1234';
        $user->email = 'user@example.com';
        $user->default_board_id = 1;
        $user->user_option_id = 1;
        $user->last_login = 123456789;
        $user->active_token = '';

        return $user;
    }

    public static function getActivity() {
        $activity = new stdClass();
        $activity->id = 1;
        $activity->user_id = 1;
        $activity->log_text = 'Log test.';
        $activity->before = '';
        $activity->after = '';
        $activity->item_type = 'test';
        $activity->item_id = 1;

        return $activity;
    }

    public static function getAttachment() {
        $attachment = new stdClass();
        $attachment->id = 1;
        $attachment->filename = 'file';
        $attachment->name = 'file.png';
        $attachment->type = 'image';
        $attachment->user_id = 1;
        $attachment->timestamp = 1234567890;

        return $attachment;
    }

    public static function getComment() {
        $comment = new stdClass();

        $comment->id = 1;
        $comment->text = 'test comment';

        return $comment;
    }

    public static function getTask() {
        $task = new stdClass();
        $task->id = 1;
        $task->title = 'test';
        $task->description = 'description';
        $task->assignee_id = 1;
        $task->category_id = 1;
        $task->color = '#ffffff';
        $task->due_date = 1234567890;
        $task->points = 3;
        $task->position = 1;
        $task->attachments[] = DataMock::getAttachment();
        $task->comments[] = DataMock::getComment();

        return $task;
    }

    public static function getUserOptions() {
        $options = new stdClass();
        $options->id = 1;
        $options->new_tasks_at_bottom = false;
        $options->show_animations = false;
        $options->show_assignee = false;
        $options->multiple_tasks_per_row = true;

        return $options;
    }
}

class LoggerMock {

    public function addInfo() {
    }

    public function addError() {
        // Uncomment to see error logs in test output
        // $msg = func_get_arg(0);
        // print 'API ERROR: ' . $msg;

        // $objs = func_get_args();
        // array_splice($objs, 0, 1);

        // foreach($objs as $obj) {
        //     var_dump($obj);
        // }
    }

}

class ContainerMock {

    public function get() {
        return new LoggerMock();
    }

}

class RequestMock {
    public $invalidPayload = false;
    public $payload = null;
    public $hasHeader = true;
    public $header = null;

    public function getBody() {
        if ($this->invalidPayload) {
            return '{}';
        }

        if ($this->payload) {
            return json_encode($this->payload);
        }

        return json_encode(DataMock::getBoard());
    }

    public function hasHeader() {
        return $this->hasHeader;
    }

    public function getHeader($header) {
        if ($this->header) {
            return $this->header;
        }

        return (array) $header;
    }
}

class ResponseMock {

    public function withJson($apiJson) {
        return $apiJson;
    }

    public function withStatus($status) {
        return $this;
    }

}

