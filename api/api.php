<?php
require_once('jsonResponse.php');
require_once(__DIR__.'/../vendor/autoload.php');

use Slim\Slim;
use RedBeanPHP\R;

$app = new Slim();
$app->response->headers->set('Content-Type', 'application/json');

$jsonResponse = new JsonResponse();
require_once('helpers.php'); // Must come after $jsonResponse exists.

// Catch Exception if connection to DB failed
function exceptionHandler($exception) {
    global $jsonResponse;

    header('Content-Type: application/json');
    http_response_code(503);

    $jsonResponse->message = 'API Error.';
    $jsonResponse->data = $exception->getMessage();
    $jsonResponse->trace = $exception->getTrace();
    echo $jsonResponse->asJson();
};
set_exception_handler('exceptionHandler');

R::setup('sqlite:'.__DIR__.'/taskboard.db');
R::setAutoResolve(TRUE);
createInitialUser();

$app->notFound(function() use ($app, $jsonResponse) {
    $app->response->setStatus(404);
    $jsonResponse->message = 'Matching API call Not found.';

    $app->response->setBody($jsonResponse->asJson());
});

$app->get('/authenticate', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->message = 'Token is authenticated.';
    }
    $app->response->setBody($jsonResponse->asJson());
});

require_once('mailFactory.php');

require_once('userRoutes.php');
require_once('boardRoutes.php');
require_once('itemRoutes.php');

$app->run();
R::close();
