<?php
abstract class BaseController {
    protected $apiJson;
    protected $logger;
    protected $container;

    public function __construct($container) {
        $this->apiJson = new ApiJson();
        $this->logger = $container->get('logger');
        $this->container = $container;
    }

    public function jsonResponse($response) {
        return $response->withJson($this->apiJson);
    }
}

