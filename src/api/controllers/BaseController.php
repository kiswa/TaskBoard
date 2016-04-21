<?php
abstract class BaseController {
    protected $apiJson;
    protected $logger;

    public function __construct($container) {
        $this->apiJson = new ApiJson();
        $this->logger = $container->get('logger');
    }

    public function jsonResponse($response) {
        return $response->withJson($this->apiJson);
    }
}

