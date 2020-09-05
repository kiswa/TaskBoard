<?php
use RedBeanPHP\R;
use Psr\Container\ContainerInterface;

abstract class BaseController {
  protected $apiJson;
  protected $logger;
  protected $dbLogger;
  protected $strings;
  protected $mailer;

  public function __construct(ContainerInterface $container) {
    $this->apiJson = new ApiJson();
    $this->logger = $container->get('logger');
    $this->dbLogger = new DbLogger();

    // Default to English
    $this->loadStrings('en');
  }

  public function setStrings($userOptionId) {
    $userOpts = R::load('useroption', $userOptionId);
    $lang = $userOpts->language;

    $this->loadStrings($lang);
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
      $this->apiJson->addAlert('error', $this->strings->api_accessRestricted);

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
      $this->apiJson->addAlert('error', $this->strings->api_accessRestricted);

      return 403;
    }

    $payload = Auth::getJwtPayload($request->getHeader('Authorization')[0]);
    $user->active_token = Auth::createJwt($user->id, $payload->mul);

    R::store($user);

    $this->setStrings($user->userOptionId);
    $this->apiJson->addData($user->active_token);

    return $status;
  }

  protected function getAdminEmailAddresses($boardId) {
    $emails = R::getAll('SELECT email FROM user u ' .
      'JOIN board_user bu ON u.id = bu.user_id ' .
      'WHERE u.security_level < 3 AND u.email <> "" AND board_id = ?',
      [$boardId]);

    return count($emails) > 0 ? $emails[0] : [];
  }

  private function loadStrings($lang) {
    $json = '{}';

    if (!$lang) {
      $lang = 'en';
    }

    $this->mailer = new Mailer($lang);

    try {
      $json =
        file_get_contents(__DIR__ . '/../../strings/' .  $lang . '_api.json');
    } catch (Exception $ex) {
      $ex->getMessage();

      $json = file_get_contents(__DIR__ . '/../../json/' . $lang . '_api.json');
    }

    $this->strings = json_decode($json);
  }
}

