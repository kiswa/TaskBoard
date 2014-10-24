<?php
require_once('lib/Slim/Slim.php');
require_once('lib/rb.php');
require_once('lib/password.php');
require_once('lib/JWT.php');

require_once('jsonResponse.php');

use Slim\Slim;
Slim::registerAutoloader();

$app = new Slim();
$app->response->headers->set('Content-Type', 'application/json');

$jsonResponse = new JsonResponse();
require_once('helpers.php'); // Must come after $jsonResponse exists.

// Catch Exception if connection to DB failed
function exceptionHandler($exception) {
    header('Content-Type: application/json');
    http_response_code(503);
    $resp = array(
	'message' => "API Error : ".$exception->getMessage()
    );
    echo json_encode($resp);
};
set_exception_handler('exceptionHandler');

R::setup('sqlite:taskboard.db');
createInitialUser();

$app->notFound(function() use ($app, $jsonResponse) {
    $app->response->setStatus(404);
    $jsonResponse->message = 'Matching API call Not found.';

    $app->response->setBody($jsonResponse->asJson());
});

// TODO: Figure out updating token on activity.
$app->get('/authenticate', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->message = 'Token is authenticated.';
//         $user = getUser();
//         setUserToken($user, (0.5 * 60 * 60) /* Half an hour */);
//         R::store($user);
//         $jsonResponse->data = $user->token;
    }
    $app->response->setBody($jsonResponse->asJson());
});

require_once('userRoutes.php');
require_once('boardRoutes.php');
require_once('itemRoutes.php');

$app->run();
R::close();
