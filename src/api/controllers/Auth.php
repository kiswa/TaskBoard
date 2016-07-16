<?php
use RedBeanPHP\R;
use Firebase\JWT\JWT;

class Auth extends BaseController {

    public static function HasBoardAccess($container, $request, $boardId) {
        $hasAccess = false;

        $userId = Auth::GetUserId($request);
        $user = new User($container, $userId);
        if ($user->security_level->getValue() === SecurityLevel::Admin) {
            return true;
        }

        $board = new Board($container, $boardId);

        foreach($board->users as $user) {
            if ($user->id === $userId) {
                // These lines are covered by multiple tests - false negative
                $hasAccess = true; // @codeCoverageIgnore
                break;             // @codeCoverageIgnore
            }
        }

        return $hasAccess;
    }

    public static function CreateInitialAdmin($container) {
        $admin = new User($container, 1);

        // Don't create more than one admin
        if ($admin->id) {
            return;
        }

        $admin->security_level = new SecurityLevel(SecurityLevel::Admin);
        $admin->username = 'admin';
        $admin->password_hash = password_hash('admin', PASSWORD_BCRYPT);
        $admin->save();
    }

    public static function CreateJwtKey() {
        $key = R::load('jwt', 1);

        // Don't create more than one secret key
        if ($key->id) {
            return;
        }

        // Generate a JWT signing key by hashing the current time.
        $key->secret = hash('sha512', strval(time()));

        R::store($key);
    }

    public static function RefreshToken($request, $response, $container) {
        if (!$request->hasHeader('Authorization')) {
            return $response->withStatus(400);
        }

        $jwt = $request->getHeader('Authorization')[0];
        $payload = self::getJwtPayload($jwt);

        if ($payload === null) {
            return $response->withStatus(401);
        }

        $user = new User($container, (int) $payload->uid);
        if ($user->active_token !== $jwt) {
            $user->active_token = '';
            $user->save();

            return $response->withStatus(401);
        }

        $jwt = self::createJwt($payload->uid);
        $user->active_token = $jwt;
        $user->save();

        $response->getBody()->write($jwt);

        return $response;
    }

    public static function GetUserId($request) {
        $uid = -1;

        try {
            $jwt = $request->getHeader('Authorization')[0];
        } catch (Exception $ex) {
            return $uid;
        }

        $payload = self::getJwtPayload($jwt);

        if ($payload !== null) {
            $uid = $payload->uid;
        }

        return $uid;
    }

    public function login($request, $response, $args) {
        $data = json_decode($request->getBody());
        $user = R::findOne('user', 'username = ?', [$data->username]);

        if ($user === null) {
            $this->apiJson->addAlert('error', 'Invalid username or password.');

            return $this->jsonResponse($response, 401);
        }

        if (!password_verify($data->password, $user->password_hash)) {
            $this->apiJson->addAlert('error', 'Invalid username or password.');

            return $this->jsonResponse($response, 401);
        }

        $jwt = self::createJwt($user->id);
        $user = new User($this->container, $user->id);

        $user->active_token = $jwt;
        $user->last_login = time();
        $user->save();

        $this->apiJson->setSuccess();
        $this->apiJson->addData($jwt);
        $this->apiJson->addData($this->sanitizeUser($user));

        return $this->jsonResponse($response);
    }

    public function logout($request, $response, $args) {
        if (!$request->hasHeader('Authorization')) {
            return $this->jsonResponse($response, 400);
        }

        $jwt = $request->getHeader('Authorization')[0];
        $payload = self::getJwtPayload($jwt);

        if ($payload === null) {
            $this->apiJson->addAlert('error', 'Invalid access token.');

            return $this->jsonResponse($response, 401);
        }

        $user = new User($this->container, $payload->uid);

        if ($user->id) {
            $user->active_token = '';
            $user->save();
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'You have been logged out.');

        return $this->jsonResponse($response);
    }

    public function authenticate($request, $response, $args) {
        if (!$request->hasHeader('Authorization')) {
            return $this->jsonResponse($response, 400);
        }

        $jwt = $request->getHeader('Authorization')[0];
        $payload = self::getJwtPayload($jwt);

        if ($payload === null) {
            $this->apiJson->addAlert('error', 'Invalid access token.');

            return $this->jsonResponse($response, 401);
        }

        $user = new User($this->container, $payload->uid);

        $this->apiJson->setSuccess();
        $this->apiJson->addData($jwt);
        $this->apiJson->addData($this->sanitizeUser($user));

        return $this->jsonResponse($response);
    }

    private function sanitizeUser($user) {
        $user->security_level = $user->security_level->getValue();
        unset($user->password_hash);
        unset($user->active_token);

        return $user;
    }

    private static function getJwtPayload($jwt) {
        try {
            $payload = JWT::decode($jwt, self::getJwtKey(), ['HS256']);
        } catch (Exception $ex) {
            return null;
        }

        return $payload;
    }

    private static function createJwt($userId) {
        return JWT::encode(array(
                    'exp' => time() + (60 * 30), // 30 minutes
                    'uid' => $userId
                ), Auth::getJwtKey());
    }

    private static function getJwtKey() {
        self::CreateJwtKey();
        $key = R::load('jwt', 1);

        return $key->secret;
    }
}

