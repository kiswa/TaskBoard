<?php

class AppMock {

    public function getContainer() {
        return new ContainerMock();
    }

}

$app = new AppMock();

class DataMock {
    public static function getJwt($userId = 1) {
        Auth::CreateJwtKey();

        $key = RedBeanPHP\R::load('jwt', 1);

        $jwt = Firebase\JWT\JWT::encode(array(
            'exp' => time() + (60 * 30), // 30 minutes
            'uid' => $userId,
            'mul' => 1
        ), $key->secret);

        $user = RedBeanPHP\R::load('user', $userId);
        $user->active_token = $jwt;
        RedBeanPHP\R::store($user);

        return $jwt;
    }

    public static function createStandardUser($username = 'standard') {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $user = DataMock::getUser();
        $user->id = 0;
        $user->username = $username;
        $user->security_level = SecurityLevel::User;

        $request->payload = $user;

        $users = new Users(new ContainerMock());
        $response = $users->addUser($request, new ResponseMock(), null);

        return $response;
    }

    public static function createBoardAdminUser() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $user = DataMock::getUser();
        $user->id = 0;
        $user->username = 'boardadmin';
        $user->security_level = SecurityLevel::BoardAdmin;

        $request->payload = $user;

        $users = new Users(new ContainerMock());
        $response = $users->addUser($request, new ResponseMock(), null);

        return $response;
    }

    public static function createUnpriviligedUser() {
        $request = new RequestMock();
        $request->header = [DataMock::getJwt()];

        $user = DataMock::getUser();
        $user->id = 0;
        $user->username = 'badtester';
        $user->security_level = SecurityLevel::Unprivileged;

        $request->payload = $user;

        $users = new Users(new ContainerMock());
        $response = $users->addUser($request, new ResponseMock(), null);

        return $response;
    }

    public static function getBoard() {
        $board = new stdClass();
        $board->id = 1;
        $board->name = 'test';
        $board->is_active = true;
        $board->columns[] = DataMock::getColumn();
        $board->categories[] = DataMock::getCategory();
        $board->auto_actions[] = DataMock::getAutoAction();
        $user = DataMock::getUser();
        $user->id = 1;
        $board->users[] = $user;

        return $board;
    }

    public static function getColumn() {
        $column = new stdClass();
        $column->id = 1;
        $column->name = 'col1';
        $column->position = 1;
        $column->board_id = 1;
        $column->tasks[] = DataMock::getTask();

        return $column;
    }

    public static function getCategory() {
        $category = new stdClass();
        $category->id = 1;
        $category->name = 'cat1';
        $category->board_id = 1;

        return $category;
    }

    public static function getAutoAction() {
        $auto_action = new stdClass();
        $auto_action->id = 1;
        $auto_action->board_id = 1;
        $auto_action->trigger = ActionTrigger::SetToCategory;
        $auto_action->source_id = 1;
        $auto_action->type = ActionType::ClearDueDate;
        $auto_action->change_to = 'null';

        return $auto_action;
    }

    public static function getUser() {
        $user = new stdClass();
        $user->id = 2;
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
        $attachment->task_id = 1;
        $attachment->timestamp = 1234567890;

        return $attachment;
    }

    public static function getComment() {
        $comment = new stdClass();

        $comment->id = 1;
        $comment->text = 'test comment';
        $comment->user_id = 1;
        $comment->task_id = 1;

        return $comment;
    }

    public static function getTask() {
        $task = new stdClass();
        $task->id = 1;
        $task->title = 'test';
        $task->description = 'description';
        $task->assignee = 1;
        $task->category_id = 1;
        $task->column_id = 1;
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
        // Uncomment to log errors to file
        // The tests cover errors, so there will be plenty to sift through
        // $msg = func_get_arg(0);
        // $err = 'API ERROR: ' . $msg . PHP_EOL;

        // $objs = func_get_args();
        // array_splice($objs, 0, 1);

        // ob_start();
        // foreach($objs as $obj) {
        //     var_dump($obj);
        // }
        // $strings = ob_get_clean();

        // file_put_contents('tests.log', [$err, $strings], FILE_APPEND);
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
    public $throwInHeader = false;

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
        if ($this->throwInHeader) {
            throw new Exception();
        }

        if ($this->header) {
            return $this->header;
        }

        return $header;
    }
}

class ResponseMock {
    public $status = 200;
    public $body;

    public function __construct() {
        $this->body = new RequestBodyMock();
    }

    public function withJson($apiJson) {
        return $apiJson;
    }

    public function withStatus($status) {
        $this->status = $status;

        return $this;
    }

    public function getStatusCode() {
        return $this->status;
    }

    public function getBody() {
        return $this->body;
    }

}

class RequestBodyMock {
    public $data;

    public function __toString() {
        return $this->data;
    }

    public function write($string) {
        $this->data = $string;
    }

}

