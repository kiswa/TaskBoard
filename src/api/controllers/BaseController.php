<?php
use RedBeanPHP\R;
use Psr\Container\ContainerInterface;

abstract class BaseController {
  protected $apiJson;
  protected $logger;
  protected $dbLogger;

  public function __construct(ContainerInterface $container) {
    $this->apiJson = new ApiJson();
    $this->logger = $container->get('logger');
    $this->dbLogger = new DbLogger();
  }

  public function jsonResponse($response, $status = 200) {
    $payload = json_encode($this->apiJson);

    $body = $response->getBody();
    $body->rewind(); // Just to be safe
    $body->write($payload);

    return $response->withHeader('Content-Type', 'application/json')
                    ->withStatus($status);
  }

  public function checkBoardAccess($boardId, $request) {
    if (!Auth::HasBoardAccess($request, $boardId)) {
      $this->apiJson->addAlert('error', 'Access restricted.');

      return false;
    }

    return true;
  }

  public function secureRoute($request, $response, $securityLevel) {
    $response = Auth::ValidateToken($request, $response);
    $status = $response->getStatusCode();

    if ($status !== 200) {
      if ($status === 400) {
        $this->apiJson->addAlert('error', 'Authorization header missing.');
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

    $this->apiJson->addData($request->getHeader('Authorization'));

    return $status;
  }
}

