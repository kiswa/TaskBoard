<?php
require './vendor/autoload.php';

use RedBeanPHP\R;
R::setup('sqlite:taskboard');

$app = new Slim\App();
require 'app-setup.php';

$app->get('/', 'Invalid:noApi');

$app->get('/boards', 'Boards:getAllBoards');

$app->run();
R::close();

