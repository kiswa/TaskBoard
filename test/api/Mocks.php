<?php

class AppMock {

    public function getContainer() {
        return new ContainerMock();
    }
}

$app = new AppMock();

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

class ResponseMock {

    public function withJson($apiJson) {
        return $apiJson;
    }

}

