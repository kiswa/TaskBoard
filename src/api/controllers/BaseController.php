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

    public function jsonResponse($response, $status = 200) {
        return $response->withStatus($status)->withJson($this->apiJson);
    }
}

