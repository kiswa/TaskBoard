<?php

abstract class BaseController {
    protected $apiJson;
    protected $logger;
    protected $dbLogger;
    protected $container;

    public function __construct($container) {
        $this->apiJson = new ApiJson();
        $this->logger = $container->get('logger');
        $this->dbLogger = new DbLogger();
        $this->container = $container;
    }

    public function jsonResponse($response) {
        return $response->withJson($this->apiJson);
    }
}

