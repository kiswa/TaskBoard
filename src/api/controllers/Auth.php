<?php
use RedBeanPHP\R;
use Firebase\JWT\JWT;

class Auth extends BaseController {

    public static function HasBoardAccess($request, $boardId, $userId = null) {
        $hasAccess = false;

        if ($userId === null) {
            $userId = self::GetUserId($request);
        }

        $user = R::load('user', $userId);
        if ((int)$user->security_level === SecurityLevel::ADMIN) {
            return true;
        }

        $board = R::load('board', $boardId);

        foreach ($board->sharedUserList as $check) {
            if ((int)$check->id === $userId) {
                $hasAccess = true;
                break;
            }
        }

        return $hasAccess;
    }

    public static function CreateInitialAdmin() {
        $admin = R::load('user', 1);

        // Don't create more than one admin
        if ($admin->id) {
            return;
        }

        $admin->security_level = SecurityLevel::ADMIN()->getValue();
        $admin->username = 'admin';
        $admin->password_hash = password_hash('admin', PASSWORD_BCRYPT);
        $admin->email = '';
        $admin->default_board_id = 0;
        $admin->user_option_id = 0;
        $admin->last_login = 0;
        // $admin->active_token = '';

        $opts = R::dispense('useroption');
        $opts->new_tasks_at_bottom = true;
        $opts->show_animations = true;
        $opts->show_assignee = true;
        $opts->multiple_tasks_per_row = false;

        R::store($opts);
        $admin->user_option_id = $opts->id;
        R::store($admin);
    }

    public static function CreateJwtSigningKey() {
        $key = R::load('jwt', 1);

        // Don't create more than one secret key
        if ($key->id) {
            return;
        }

        // Generate a JWT signing key by hashing the current time.
        $key->secret = hash('sha512', strval(time()));

        R::store($key);
    }

    public static function RefreshToken($request, $response) {
        if (!$request->hasHeader('Authorization')) {
            return $response->withStatus(400);
        }

        $jwt = $request->getHeader('Authorization')[0];
        $payload = self::getJwtPayload($jwt);

        if ($payload === null) {
            return $response->withStatus(401);
        }

        // $user = R::load('user', $payload->uid);
        // if ($user->active_token !== $jwt) {
        //     $user->active_token = '';
        //     R::store($user);
        //
        //     return $response->withStatus(401);
        // }

        $jwt = self::createJwt($payload->uid, (int)$payload->mul);
        // $user->active_token = $jwt;
        // R::store($user);

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

    public function login($request, $response) {
        $data = json_decode($request->getBody());
        $user = R::findOne('user', 'username = ?', [$data->username]);

        if ($user === null) {
            $this->logger->addError('Login: ', [$data]);
            $this->apiJson->addAlert('error', 'Invalid username or password.');

            return $this->jsonResponse($response, 401);
        }

        if (!password_verify($data->password, $user->password_hash)) {
            $this->logger->addError('Login: ', [$data]);
            $this->apiJson->addAlert('error', 'Invalid username or password.');

            return $this->jsonResponse($response, 401);
        }

        $jwt = self::createJwt($user->id, ($data->remember ? 200 : 1));
        $user = R::load('user', $user->id);

        if ($user->username === 'admin' && (int)$user->last_login === 0) {
            $this->apiJson->addAlert('warn',
                'This is your first login, go to Settings ' .
                'to change your password.');
            $this->apiJson->addAlert('success',
                'Go to Settings to create your first board.');
        }

        // $user->active_token = $jwt;
        $user->last_login = time();
        R::store($user);

        $this->dbLogger->logChange($user->id, $user->username . ' logged in',
            null, null, 'user', $user->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addData($jwt);
        $this->apiJson->addData($this->sanitizeUser($user));

        return $this->jsonResponse($response);
    }

    public function logout($request, $response) {
        if (!$request->hasHeader('Authorization')) {
            return $this->jsonResponse($response, 400);
        }

        $jwt = $request->getHeader('Authorization')[0];
        $payload = self::getJwtPayload($jwt);

        if ($payload === null) {
            $this->apiJson->addAlert('error', 'Invalid access token.');

            return $this->jsonResponse($response, 401);
        }

        $user = R::load('user', $payload->uid);

        // if ($user->id) {
        //     $user->active_token = '';
        //     R::store($user);
        // }

        $this->dbLogger->logChange($user->id, $user->username . ' logged out',
            null, null, 'user', $user->id);
        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'You have been logged out.');

        return $this->jsonResponse($response);
    }

    public function authenticate($request, $response) {
        if (!$request->hasHeader('Authorization')) {
            return $this->jsonResponse($response, 400);
        }

        $jwt = $request->getHeader('Authorization')[0];
        $payload = self::getJwtPayload($jwt);

        if ($payload === null) {
            $this->apiJson->addAlert('error', 'Invalid access token.');

            return $this->jsonResponse($response, 401);
        }

        $user = R::load('user', $payload->uid);
        $opts = R::load('useroption', $user->user_option_id);

        $this->apiJson->setSuccess();
        $this->apiJson->addData($jwt);
        $this->apiJson->addData($this->sanitizeUser($user));
        $this->apiJson->addData($opts);

        return $this->jsonResponse($response);
    }

    private function sanitizeUser($user) {
        unset($user->password_hash);
        // unset($user->active_token);

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

    private static function createJwt($userId, $mult = 1) {
        // If 'remember me' feature is desired, set the multiplier higher
        return JWT::encode(array(
                    'exp' => time() + (60 * 30) * $mult, // 30 minutes * $mult
                    'uid' => (int)$userId,
                    'mul' => $mult
                ), Auth::getJwtKey());
    }

    private static function getJwtKey() {
        self::CreateJwtSigningKey();
        $key = R::load('jwt', 1);

        return $key->secret;
    }
}

