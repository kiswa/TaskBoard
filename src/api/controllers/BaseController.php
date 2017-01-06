<?php
use RedBeanPHP\R;

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

    public function checkBoardAccess($boardId, $request) {
        if (!Auth::HasBoardAccess($request, $boardId)) {
            $this->apiJson->addAlert('error', 'Access restricted.');

            return false;
        }

        return true;
    }

    public function secureRoute($request, $response, $securityLevel) {
        $response = Auth::RefreshToken($request, $response);
        $status = $response->getStatusCode();

        if ($status !== 200) {
            if ($status === 400) {
                $this->apiJson->addAlert('error',
                    'Authorization header missing.');
                return $status;
            }

            $this->apiJson->addAlert('error', 'Invalid API token.');
            return $status;
        }

        $user = R::load('user', Auth::GetUserId($request));
        if ((int)$user->security_level > $securityLevel) {
            $this->apiJson->addAlert('error', 'Insufficient privileges.');

            return 403;
        }

        $this->apiJson->addData((string) $response->getBody());

        return $status;
    }
}

