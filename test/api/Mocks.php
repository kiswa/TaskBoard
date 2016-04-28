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
        $auto_action->trigger = ActionTrigger::MoveToColumn;
        $auto_action->trigger_id = 1;
        $auto_action->type = ActionType::SetColor;
        $auto_action->color = '#ffffff';

        return $auto_action;
    }

    public static function getUser() {
        $user = new stdClass();
        $user->id = 1;
        $user->security_level = 1;
        $user->username = 'tester';

        return $user;
    }
}

class LoggerMock {

    public function addInfo() {
    }

    public function addError() {
    }

}

class ContainerMock {

    public function get() {
        return new LoggerMock();
    }

}

class RequestMock {

    public function getBody() {
        return '{}';
    }

}

class ResponseMock {

    public function withJson($apiJson) {
        return $apiJson;
    }

}

