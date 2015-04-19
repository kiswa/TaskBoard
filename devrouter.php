<?php
$root = __DIR__;
$file = $_SERVER['REQUEST_URI'];

if(file_exists($root.'/'.$file)){
    return false;
}

$_SERVER['REQUEST_URI'] = str_replace('/api/', '/', $_SERVER['REQUEST_URI']);
$_SERVER['REQUEST_URI'] = str_replace('/api', '/', $_SERVER['REQUEST_URI']);

$_SERVER['SCRIPT_NAME'] = '/';

$_SERVER['PHP_SELF'] = $_SERVER['REQUEST_URI'];
$_SERVER['PATH_INFO'] = $_SERVER['PHP_SELF'];

require_once 'api/api.php';