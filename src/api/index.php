<?php
require './vendor/autoload.php';

use RedBeanPHP\R;
R::setup('sqlite:taskboard.sqlite');

$app = new Slim\App();
require 'app-setup.php';

$app->get   ('/', 'Invalid:noApi');

$app->get   ('/boards',      'Boards:getAllBoards');
$app->get   ('/boards/{id}', 'Boards:getBoard');
$app->post  ('/boards',      'Boards:addBoard');
$app->post  ('/boards/{id}', 'Boards:updateBoard');
$app->delete('/boards/{id}', 'Boards:removeBoard');

$app->get   ('/autoactions',      'AutoActions:getAllActions');
$app->post  ('/autoactions',      'AutoActions:addAction');
$app->delete('/autoactions/{id}', 'AutoActions:removeAction');
/*
$app->get   ('/columns/{id}', 'Columns:getColumn');
$app->post  ('/columns',      'Columns:addColumn');
$app->post  ('/columns/{id}', 'Columns:updateColumn');
$app->delete('/columns/{id}', 'Columns:removeColumn');

$app->get   ('/items/{id}', 'Items:getItem');
$app->post  ('/items',      'Items:addItem');
$app->post  ('/items/{id}', 'Items:updateItem');
$app->delete('/items/{id}', 'Items:removeItem');

$app->get   ('/comments/{id}', 'Comments:getComment');
$app->post  ('/comments',      'Comments:addComment');
$app->post  ('/comments/{id}', 'Comments:updateComment');
$app->delete('/comments/{id}', 'Comments:removeComment');
*/
$app->get   ('/attachments/{id}', 'Attachments:getAttachment');
$app->post  ('/attachments',      'Attachments:addAttachment');
$app->post  ('/attachments/{id}', 'Attachments:updateAttachment');
$app->delete('/attachments/{id}', 'Attachments:removeAttachment');
/*
$app->get   ('/users',      'Users:getAllUsers');
$app->get   ('/users/{id}', 'Users:getUser');
$app->post  ('/users',      'Users:addUser');
$app->post  ('/users/{id}', 'Users:updateUser');
$app->delete('/users/{id}', 'Users:removeUser');

$app->post('/authenticate', 'Users:authenticate');
$app->post('/login',        'Users:login');
$app->post('/logout',       'Users:logout');
*/
$app->run();
R::close();

