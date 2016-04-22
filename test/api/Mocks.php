<?php

class LoggerMock {

    public function addInfo() {
    }

    public function addError() {
    }

}

class ControllerMock {

    public function get() {
        return new LoggerMock();
    }

}

class ResponseMock {

    public function withJson($apiJson) {
        return $apiJson;
    }

}

