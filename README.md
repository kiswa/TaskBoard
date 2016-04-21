# TaskBoard

 [![Build Status](https://travis-ci.org/kiswa/TaskBoard.svg)](https://travis-ci.org/kiswa/TaskBoard) [![Join the chat at https://gitter.im/kiswa/TaskBoard](https://badges.gitter.im/kiswa/TaskBoard.svg)](https://gitter.im/kiswa/TaskBoard?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A [Kanban](http://en.wikipedia.org/wiki/Kanban_board)-inspired app for keeping track of things that need to get done.

The goal of TaskBoard is to provide a simple and clean interface to a functional and minimal application for keeping track of tasks. **It's not trying to be the next Trello or LeanKit.**

## Installation

### Prerequisites

A web server running PHP with sqlite enabled. Developed and tested under Apache2 running PHP 5.5+.

The server must have `sqlite` and `php5-sqlite` installed, as well as the `rewrite` Apache module.

If you're comfortable changing code, you can use any database [supported by RedBeanPHP](http://www.redbeanphp.com/index.php?p=/connection).

### Install

Installing TaskBoard is as easy as 1, 2, 3!

 1. Download the latest release (or whatever version you want)
 2. Extract it to your webserver
 3. Verify the `api` directory is writable

### Development

Developing on TaskBoard is pretty simple too.

 1. Clone the repository
 2. Run `npm i` to install dependencies (Linting the SCSS requires Ruby and running `gem install scss-lint`)
 3. Run `git checkout dev` to work on the `dev` branch

### How It's Made

1. Front end

 * [Angular 2](https://angular.io/) single-page app
 * [Bourbon](http://bourbon.io/) and [Neat](http://neat.bourbon.io/) SCSS library & framework
 * [marked](https://github.com/chjj/marked) Markdown parser

2. Back end

 * [Slim Framework](http://www.slimframework.com/) and [RedBeanPHP](http://www.redbeanphp.com/) for a RESTful API
 * [PHPMailer](https://github.com/PHPMailer/PHPMailer) for sending emails.
 * [JWT](https://jwt.io/) authentication
 * [SQLite](https://www.sqlite.org/) database

## Features

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

### Items

An item (task) only has to have a Title to be added to a board, but there is much more available. Items may be assigned to any user on the board (or left Unassigned), and include options for Due Date, Color, Points (an optional difficulty rating), and Category.

TaskBoard uses a [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#table-of-contents) parser for the Description, allowing for better display of details (like this readme).

Once an item has been entered, it may have Comments or Attachments added to it by viewing the task detail. There is a link to edit the item, which takes you to a modal much like the original add item dialog. For admin users, there is also a link to delete the item. This view also shows the task's activity log on the right side of the screen, displaying the complete history of events related to the item.

## Feedback

Constructive feedback is appreciated! If you have ideas for improvement, please [add an issue](https://github.com/kiswa/TaskBoard/issues) or implement it and submit a pull request.

If you find a bug, please post it on the [Issue Tracker](https://github.com/kiswa/TaskBoard/issues).

