<?php
use RedBeanPHP\R;
use Firebase\JWT\JWT;

class Auth extends BaseController {

    public static function CreateInitialAdmin($container) {
        $admin = new User($container, 1);

        if ($admin->id === 1) {
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

    // TODO: Determine if this endpoint is needed.
    // The new API should be varifying and updating the user's
    // token on each call so an authentication endpoint should not
    // be needed. The code will remain for now as an example of what
    // to do in the future.
    public function authenticate($request, $response, $args) {
        if (!$request->hasHeader('Authorization')) {
            return $this->jsonResponse($response, 400);
        }

        $jwt = $request->getHeader('Authorization')[0];
        $payload = $this->getJwtPayload($jwt);

        if ($payload === null) {
            return $this->jsonResponse($response, 401);
        }

        $user = new User($this->container, (int) $payload->uid);
        if ($user->active_token !== $jwt) {
            $user->active_token = '';
            $user->save();

            $this->apiJson->addAlert('error', 'Invalid access token.');

            return $this->jsonResponse($response, 401);
        }

        $jwt = $this->createJwt($payload->uid);
        $user->active_token = $jwt;
        $user->save();

        $this->apiJson->setSuccess();
        $this->apiJson->addData($jwt);

        return $this->jsonResponse($response);
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

        $jwt = $this->createJwt($user->id);
        $user = new User($this->container, $user->id);

        $user->active_token = $jwt;
        $user->last_login = time();
        $user->save();

        $this->apiJson->setSuccess();
        $this->apiJson->addData($jwt);

        return $this->jsonResponse($response);
    }

    public function logout($request, $response, $args) {
        if (!$request->hasHeader('Authorization')) {
            return $this->jsonResponse($response, 400);
        }

        $jwt = $request->getHeader('Authorization')[0];
        $payload = $this->getJwtPayload($jwt);

        if ($payload === null) {
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

    private function getJwtPayload($jwt) {
        try {
            $payload = JWT::decode($jwt, $this->getJwtKey(), ['HS256']);
        } catch (Exception $ex) {
            $this->apiJson->addAlert('error', 'Invalid access token.');

            return null;
        }

        return $payload;
    }

    private function createJwt($userId) {
        return JWT::encode(array(
                    'exp' => time() + (60 * 30), // 30 minutes
                    'uid' => $userId
                ), $this->getJwtKey());
    }

    private function getJwtKey() {
        self::CreateJwtKey();
        $key = R::load('jwt', 1);

        return $key->secret;
    }
}

