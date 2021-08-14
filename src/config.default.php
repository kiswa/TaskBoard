<?php
// Do not edit config.default.php as this may hinder your upgrade to a future version.
// Make a copy of it called config.php!

return array(
/**
 * Database configuration settings.
 *
 * SQLite does not use or need a user or password.
 *
 * For SQLite, use sqlite:path_to_db.sqlite (the path is relative to the api/ directory).
 *
 * For Postgres, use e.g. pgsql:host=localhost;dbname=taskboard for a TCP connection,
 *              or e.g. pgsql:dbname=taskboard for a UNIX socket connection
 *
 * See https://redbeanphp.com/index.php?p=/connection for more options.
 */
'database' => 'sqlite:taskboard.sqlite',
'database_user' => '',
'database_password' => '',


);
