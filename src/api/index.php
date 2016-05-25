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

$app->get   ('/autoactions',      'AutoActions:getAllActions');     // User
$app->post  ('/autoactions',      'AutoActions:addAction');         // BoardAdmin
$app->delete('/autoactions/{id}', 'AutoActions:removeAction');      // BoardAdmin

$app->get   ('/columns/{id}',     'Columns:getColumn');             // User (with board access)
$app->post  ('/columns',          'Columns:addColumn');             // BoardAdmin
$app->post  ('/columns/{id}',     'Columns:updateColumn');          // BoardAdmin
$app->delete('/columns/{id}',     'Columns:removeColumn');          // BoardAdmin

$app->get   ('/tasks/{id}',       'Tasks:getTask');                 // User
$app->post  ('/tasks',            'Tasks:addTask');                 // User
$app->post  ('/tasks/{id}',       'Tasks:updateTask');              // BoardAdmin or submitter
$app->delete('/tasks/{id}',       'Tasks:removeTask');              // BoardAdmin or submitter

$app->get   ('/comments/{id}',    'Comments:getComment');           // User
$app->post  ('/comments',         'Comments:addComment');           // User
$app->post  ('/comments/{id}',    'Comments:updateComment');        // BoardAdmin or submitter
$app->delete('/comments/{id}',    'Comments:removeComment');        // BoardAdmin or submitter

$app->get   ('/attachments/{id}', 'Attachments:getAttachment');     // User
$app->post  ('/attachments',      'Attachments:addAttachment');     // User
$app->delete('/attachments/{id}', 'Attachments:removeAttachment');  // BoardAdmin or submitter

$app->get   ('/users',            'Users:getAllUsers');             // User (by board access)
$app->get   ('/users/{id}',       'Users:getUser');                 // User (by board access)
$app->post  ('/users',            'Users:addUser');                 // Admin
$app->post  ('/users/{id}',       'Users:updateUser');              // Admin
$app->delete('/users/{id}',       'Users:removeUser');              // Admin

$app->post('/login',              'Auth:login');                    // Unsecured
$app->post('/logout',             'Auth:logout');                   // Unsecured

$app->run();
R::close();

