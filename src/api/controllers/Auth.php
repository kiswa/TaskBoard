<?php
use RedBeanPHP\R;
use Firebase\JWTi\JWT;

class Auth extends BaseController {

    public function authenticate($request, $response, $args) {
        if (!$request->hasHeader('Authorization')) {
            return $response->withStatus(400); // Bad Request
        }

        $jwt = $request->getHeader('Authorization');
        $payload = null;

        try {
            $payload = JWT::decode($jwt, getJwtKey(), array('HS256'));
        } catch (Exception $ex) {
        }

        // Issue new token with extended expiration

        return $response->withJson(json_encode($jwt));
    }

    public function login($request, $response, $args) {
        $data = json_decode($request->getBody());
        $user = R::findOne('user', 'username = ?', [$data->username]);

        if ($user === null) {
            $this->apiJson->addAlert('error', 'Invalid username or password.');

            return $this->jsonResponse($response);
        }

        if (!password_verify($data->password, $user->password_hash)) {
            $this->apiJson->addAlert('error', 'Invalid username or password.');

            return $this->jsonResponse($response);
        }

        // Username and password verified
        // Issue JWT
    }

    public function logout($request, $response, $args) {
    }

    private function generateJwt() {
    }

    private function getJwtKey() {
        $key = R::load('jwt', 1);

        if ($key->id === 0) {
            // Generate a JWT key by hashing the current time.
            // This should make (effectively) every instance of TaskBoard
            // have a unique secret key for JWTs.
            $key->token = password_hash(strval(time()), PASSWORD_BCRYPT);

            R::store($key);
        }

        return $key->token;
    }
}

