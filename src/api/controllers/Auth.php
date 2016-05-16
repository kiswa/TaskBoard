<?php
use RedBeanPHP\R;
use Firebase\JWT;

class Auth extends BaseController {
    public function authenticate($request, $response, $args) {
        if (!$request->hasHeader('Authorization') {
            $apiJson = new ApiJson();

            return $response->withStatus(400); // Bad Request
        }

        $jwt = $response->getHeader('Authorization');

        // Validate token
        // Issue new token with extended expiration
    }

    public function login($request, $response, $args) {
        $data = json_decode($request->getBody());
        $user = R::findOne('user', 'username = ?', [$data->username]);

        if ($user === null) {
            $this->apiJson->addAlert('error', 'Invalid username or password.');

            return $this->jsonResponse($response);
        }

        if ($user->password !== $this->hashPassword($data->password, $user->salt) {
            $this->apiJson->addAlert('error', 'Invalid username or password.');

            return $this->jsonResponse($response);
        }

        // Username and password verified
        // Issue JWT
    }

    public function logout($request, $response, $args) {
    }

    private function getJwtKey() {
        $key = R::load('jwt', 1);

        if ($key->id === 0) {
            $key->token = password_hash(strval(time()), PASSWORD_BCRYPT);
            R::store($key);
        }

        return $key->token;
    }

    private function hashPassword($password, $salt) {
        return password_hash($data->password, PASSWORD_BCRYPT,
            array('salt' => $salt));
    }
}

