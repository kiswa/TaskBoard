<?php
use Slim\Factory\AppFactory;
use Slim\Exception\HttpNotFoundException;
use Slim\Psr7\Response;

use Selective\BasePath\BasePathDetector;

use RedBeanPHP\R;

require './vendor/autoload.php';

R::setup('sqlite:taskboard.sqlite');

$container = new DI\Container();
AppFactory::setContainer($container);

$app = AppFactory::create();
$basePath = (new BasePathDetector($_SERVER))->getBasePath();

$app->setBasePath($basePath .  '/api');
$app->addRoutingMiddleware();

$errorMiddleware = $app->addErrorMiddleware(true, true, true);

$container = $app->getContainer();

// Inject a Monolog logger into the dependency container
$container->set('logger', function() {
  $logger = new Monolog\Logger('API');

  $logger->pushHandler(new Monolog\Handler\StreamHandler(
    'logs/api.log', Monolog\Logger::INFO)
  );

  return $logger;
});

$errorMiddleware->setErrorHandler(HttpNotFoundException::class,
  function ($request, $exception, $displayErrorDetails) {
    $response = new Response();

    $response->withHeader('Content-Type', 'application/json')
             ->getBody()->write('{ message: "Matching API call not found." }');

    return $response->withStatus(404);
  }
);

Auth::CreateInitialAdmin();
Auth::CreateJwtSigningKey();

$app->get('/', 'Invalid:noApi');

$app->get('/boards', 'Boards:getAllBoards'); // User (by board access)
$app->get('/boards/{id}', 'Boards:getBoard'); // User (with board access)
$app->post('/boards', 'Boards:addBoard'); // Admin
$app->post('/boards/{id}', 'Boards:updateBoard'); // BoardAdmin (with board access)
$app->delete('/boards/{id}', 'Boards:removeBoard'); // Admin

$app->get('/autoactions', 'AutoActions:getAllActions'); // User (by board access)
$app->post('/autoactions', 'AutoActions:addAction'); // BoardAdmin (with board access)
$app->delete('/autoactions/{id}', 'AutoActions:removeAction'); // BoardAdmin (with board access)

$app->get('/columns/{id}', 'Columns:getColumn'); // User (with board access)
$app->post('/columns', 'Columns:addColumn'); // BoardAdmin (with board access)
$app->post('/columns/{id}', 'Columns:updateColumn'); // BoardAdmin (with board access)
$app->delete('/columns/{id}', 'Columns:removeColumn'); // BoardAdmin (with board access)

$app->get('/tasks/{id}', 'Tasks:getTask'); // User (with board access)
$app->post('/tasks', 'Tasks:addTask'); // User (with board access)
$app->post('/tasks/{id}', 'Tasks:updateTask'); // User (with board access)
$app->delete('/tasks/{id}', 'Tasks:removeTask'); // User (with board access)

$app->get('/comments/{id}', 'Comments:getComment'); // User (with board access)
$app->post('/comments', 'Comments:addComment'); // User (with board access)
$app->post('/comments/{id}', 'Comments:updateComment'); // BoardAdmin or submitter (with board access)
$app->delete('/comments/{id}', 'Comments:removeComment'); // BoardAdmin or submitter (with board access)

$app->get('/attachments/{id}', 'Attachments:getAttachment'); // User (with board access)
$app->post('/attachments', 'Attachments:addAttachment'); // User (with board access)
$app->delete('/attachments/{id}', 'Attachments:removeAttachment'); // BoardAdmin or submitter (with board access)

$app->get('/users', 'Users:getAllUsers'); // User (by board access)
$app->get('/users/{id}', 'Users:getUser'); // User (by board access)
$app->post('/users', 'Users:addUser'); // Admin
$app->post('/users/{id}', 'Users:updateUser'); // User (limited to self - Higher can edit any)
$app->post('/users/{id}/opts', 'Users:updateUserOptions'); // User (limited to self)
$app->post('/users/{id}/cols', 'Users:toggleCollapsed'); // User (limited to self)
$app->delete('/users/{id}', 'Users:removeUser'); // Admin

$app->get('/activity[/{type}[/{id}]]', 'Activity:getActivity'); // BoardAdmin (with board access)

$app->post('/login', 'Auth:login'); // Unsecured (creates JWT)
$app->post('/logout', 'Auth:logout'); // Unsecured (clears JWT)
$app->post('/authenticate', 'Auth:authenticate'); // Unsecured (checks JWT)
$app->post('/refresh', 'Auth:refreshToken'); // Unsecured (checks and updates JWT)

$app->run();
R::close();

