# TaskBoard

 [![Build Status](https://travis-ci.org/kiswa/TaskBoard.svg)](https://travis-ci.org/kiswa/TaskBoard) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/77952f4ac9b44e9fbebe7758442d356d)](https://www.codacy.com/app/kiswa-com/TaskBoard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=kiswa/TaskBoard&amp;utm_campaign=Badge_Grade) [![Join the chat at https://gitter.im/kiswa/TaskBoard](https://badges.gitter.im/kiswa/TaskBoard.svg)](https://gitter.im/kiswa/TaskBoard?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Join the discussion at https://reddit.com/r/TaskBoard](https://cdn.rawgit.com/kiswa/TaskBoard/09444718053f7405636ab2205ad0f12413df7a20/reddit.svg)](https://reddit.com/r/TaskBoard)

A [Kanban](http://en.wikipedia.org/wiki/Kanban_board)-inspired app for keeping track of things that need to get done.

The goal of TaskBoard is to provide a simple and clean interface to a functional and minimal application for keeping track of tasks. **It's not trying to be the next Trello or LeanKit.**

## Installation

### Prerequisites

A web server running PHP 5.6, 7.0, or 7.1 with sqlite enabled.

The server must have `sqlite3` and `php7-sqlite` (or `php5-sqlite`) installed.

If you're comfortable changing code, you can use any database [supported by RedBeanPHP](http://www.redbeanphp.com/index.php?p=/connection).

### Install

Installing TaskBoard is as easy as 1, 2, 3!

 1. Download [the latest release](#) (or whatever version you want)
 2. Extract it to your webserver
 3. Verify the `api` directory is writable

### Server Config

#### Apache

The directory you create for TaskBoard must have `AllowOverride` set so the .htaccess files work.

You also have to have `mod_rewrite` installed and enabled.

#### NGINX

TODO

#### IIS

See the [Wiki Page](https://github.com/kiswa/TaskBoard/wiki/TaskBoard-on-IIS)

### First Use

Open a web browser to the location you installed TaskBoard and use `admin` as the username and password to log into TaskBoard.

Go to the `Settings` page to update your user (username, email, password, *etc.*) and create your first board!

## Features

### Users & Settings

There are three types of users, and the settings page is slightly different for each.

 * User - View boards assigned to them and update their own settings and options.
 * Board Admin - Same as above, with the ability to manage boards they are added to.
 * Admin - Same as above, with the ability to add/remove users and boards.

![Settings Page](./.github/settings.png)

### Boards

Each board may have as many columns as needed. For example, a software project might have columns like:

 * Proposed
 * Backlog
 * In Work
 * Test
 * Done
 * Archived

Or maybe you want to track a simple todo list with just:

 * Todo
 * Doing
 * Done

It's all up to you! However many columns you have, each column may have tasks added to it, and tasks can be dragged to other columns as they progress (or edited and assigned to a new column).

Boards may also have categories for additional organization, *e.g.* `Bug`, `Enhancement`, `New Feature`.

### Tasks

A task only has to have a Title to be added to a board, but there is much more available. Tasks may be assigned to any user on the board (or left Unassigned), and include options for Due Date, Color, Points (an optional difficulty rating), and Category.

TaskBoard uses a [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#table-of-contents) parser for the Description, allowing for better display of details (like this readme).

Once a task has been entered, it may have Comments (also supporting Markdown) or Attachments added to it by viewing the task detail. There is a link to edit the task, which takes you to a modal much like the original add task dialog. For admin users, there is also a link to delete the task. This view also shows the task's activity log on the side of the screen, displaying the complete history of events related to the task.

## Development

Developing on TaskBoard is pretty simple too.

 1. Clone the repository
 2. Run `npm i` to install dependencies (Linting the SCSS requires Ruby and running `gem install scss-lint`)
 3. Run `git checkout dev` to work on the `dev` branch

#### Unit Tests

Both the API and App are unit tested. To run all tests, use the command `gulp test`. For only one set, run `gulp test-api` or `gulp test-app`.

If you want to run a single API test, add the following comment block before the test function and use the command `gulp test-api-single`.

``` php
/**
 * @group single
 */
```

If you want to run a single App test, change the test from `it('should do something', ...);` to `it.only('should do something', ...);` and Mocha will only run that test.

These tests are run by [Travis CI](https://travis-ci.org/) on PRs and commits. A PR with failing or missing tests will not be merged.

## Contributing

Fork the repository and make your changes on the `dev` branch.

Create a pull request against the `dev` branch to merge your changes with the main repository.

Make sure to include/update unit tests.

## Feedback

Constructive feedback is appreciated! If you have ideas for improvement, please [add an issue](https://github.com/kiswa/TaskBoard/issues) or implement it and submit a pull request.

If you find a bug, please post it on the [Issue Tracker](https://github.com/kiswa/TaskBoard/issues).

## How It's Made

##### Front End

 * [Angular](https://angular.io/) single-page app (not AngularJS)
 * [Bourbon](http://bourbon.io/) and [Neat](http://neat.bourbon.io/) SCSS library & grid
 * [scss-base](https://www.npmjs.com/package/scss-base) for the base styling
 * [marked](https://github.com/chjj/marked) Markdown parser
 * [Chartist.js](https://gionkunz.github.io/chartist-js/) for all charts

##### Back End

 * [Slim Framework](http://www.slimframework.com/) and [RedBeanPHP](http://www.redbeanphp.com/) for a RESTful API
 * [PHPMailer](https://github.com/PHPMailer/PHPMailer) for sending emails
 * [JWT](https://jwt.io/) authentication
 * [SQLite](https://www.sqlite.org/) database

## Lines of Code

Because I like seeing the numbers.

### `src`

Language     |   Files |    Blank | Comment |     Code
-------------|--------:|---------:|--------:|---------:
TypeScript   |      60 |      698 |      27 |     3232
PHP          |      18 |      561 |      19 |     1751
HTML         |      19 |      135 |       0 |     1183
SASS         |      14 |      223 |      12 |     1018
__SUM:__     | __111__ | __1617__ |  __58__ | __7184__

Command: `cloc --exclude-dir=vendor --exclude-ext=json src/`

Language     |  Files |    Blank | Comment |     Code
-------------|-------:|---------:|--------:|---------:
JavaScript   |     44 |      528 |      51 |     2140
PHP          |     10 |      688 |      19 |     2014
__SUM:__     | __54__ | __1216__ |  __70__ | __4154__

Command: `cloc --exclude-ext=xml test/`

