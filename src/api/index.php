<?php
require './vendor/autoload.php';

use RedBeanPHP\R;
R::setup('sqlite:taskboard.sqlite');

$app = new Slim\App();
require 'app-setup.php';

Auth::CreateInitialAdmin($container);
Auth::CreateJwtKey();

// Request | Route               | Handler                         | Minimum Security Level
//---------|---------------------|---------------------------------|---------------------------
$app->get   ('/',                 'Invalid:noApi');

$app->get   ('/boards',           'Boards:getAllBoards');           // User (by board access)
$app->get   ('/boards/{id}',      'Boards:getBoard');               // User (with board access)
$app->post  ('/boards',           'Boards:addBoard');               // Admin
$app->post  ('/boards/{id}',      'Boards:updateBoard');            // BoardAdmin (with board access)
$app->delete('/boards/{id}',      'Boards:removeBoard');            // Admin

$app->get   ('/autoactions',      'AutoActions:getAllActions');     // User (by board access)
$app->post  ('/autoactions',      'AutoActions:addAction');         // BoardAdmin (with board access)
$app->delete('/autoactions/{id}', 'AutoActions:removeAction');      // BoardAdmin (with board access)

$app->get   ('/columns/{id}',     'Columns:getColumn');             // User (with board access)
$app->post  ('/columns',          'Columns:addColumn');             // BoardAdmin (with board access)
$app->post  ('/columns/{id}',     'Columns:updateColumn');          // BoardAdmin (with board access)
$app->delete('/columns/{id}',     'Columns:removeColumn');          // BoardAdmin (with board access)

$app->get   ('/tasks/{id}',       'Tasks:getTask');                 // User (with board access)
$app->post  ('/tasks',            'Tasks:addTask');                 // User (with board access)
$app->post  ('/tasks/{id}',       'Tasks:updateTask');              // User (with board access)
$app->delete('/tasks/{id}',       'Tasks:removeTask');              // User (with board access)

$app->get   ('/comments/{id}',    'Comments:getComment');           // User (with board access)
$app->post  ('/comments',         'Comments:addComment');           // User (with board access)
$app->post  ('/comments/{id}',    'Comments:updateComment');        // BoardAdmin or submitter (with board access)
$app->delete('/comments/{id}',    'Comments:removeComment');        // BoardAdmin or submitter (with board access)

$app->get   ('/attachments/{id}', 'Attachments:getAttachment');     // User (with board access)
$app->post  ('/attachments',      'Attachments:addAttachment');     // User (with board access)
$app->delete('/attachments/{id}', 'Attachments:removeAttachment');  // BoardAdmin or submitter (with board access)

$app->get   ('/users',            'Users:getAllUsers');             // User (by board access)
$app->get   ('/users/{id}',       'Users:getUser');                 // User (by board access)
$app->post  ('/users',            'Users:addUser');                 // Admin
$app->post  ('/users/{id}',       'Users:updateUser');              // Admin
$app->delete('/users/{id}',       'Users:removeUser');              // Admin

$app->post  ('/login',            'Auth:login');                    // Unsecured
$app->post  ('/logout',           'Auth:logout');                   // Unsecured
$app->post  ('/authenticate',     'Auth:authenticate');             // Unsecured

$app->run();
R::close();

