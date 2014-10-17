#TaskBoard

A [Kanban](http://en.wikipedia.org/wiki/Kanban_board)-inspired app for keeping track of things that need to get done.

The goal of TaskBoard is to provide a simple and clean interface to a functional and minimal application for keeping track of tasks. It's not trying to be the next Trello or LeanKit.

###How It's Made

1. Front end

 * [AngularJS](https://angularjs.org/) single-page app.

 * [ng-context-menu](https://github.com/ianwalter/ng-context-menu), [jQueryUI Datepicker](http://jqueryui.com/datepicker/), [Spectrum](http://bgrins.github.io/spectrum/) colorpicker, [(noty)](http://ned.im/noty/) notifications, [marked](https://github.com/chjj/marked) Markdown parser, and [-prefix-free](http://leaverou.github.io/prefixfree/) CSS prefix helper.

 * [Bootstrap](http://getbootstrap.com/) for base look and feel.

2. Back end

 * RESTful API written in PHP, using [Slim Framework](http://www.slimframework.com/) for routing and [RedBeanPHP](http://www.redbeanphp.com/) for database ORM.

 * Token-based authentication.

 * SQLite database.

##Installation

###Requirements
A web server running PHP with sqlite enabled. Developed and tested under Apache2 running PHP 5.5+.

###Install
Installing TaskBoard is as easy as 1, 2, 3!

**Note:** You can skip step 2 if you don't care about minification of JavaScript and CSS for a production environment!

1. Clone the repository directly where you want it, or clone and copy to it's final location.

        git clone https://github.com/kiswa/TaskBoard.git

2. Open `TaskBoard/build/` in a terminal and run `./build-all`.

3. Visit the site and log in with the username and password `admin` (and don't forget to change the password once you're in!).

**Note:** Ensure `TaskBoard/api/` is writable so the back end can do its job!

##Features

###Settings
The settings page allows normal users to see what boards they have access to and edit their user settings.

Admin users have the same, with the additional abilities of adding/editing users and boards, and viewing a log of all activity in TaskBoard.

![Settings Image](http://taskboard.matthewross.me/docs/images/settings-standard.png)

###Boards
Each board may have as many lanes as needed. For example, a software project might have lanes like:

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

It's all up to you! However many lanes you have, each lane may have tasks added to it, and tasks can be dragged to other lanes as they progress (or edited and assigned to a new lane).

Boards may also have categories for additional organization, *e.g.* `Bug`, `Enhancement`, `New Feature`.

![Board Image](http://taskboard.matthewross.me/images/board.png)

###Items
An item (task) only has to have a Title to be added to a board, but there is much more than that available. Items may be assigned to any user on the board (or left Unassigned), and include options for Due Date, Color, Points (an optional difficulty rating), and Category.

TaskBoard uses a [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#table-of-contents) parser for the Description, allowing for better display of details (like this readme).

Once an item has been entered, it may have Comments or Attachments added to it by viewing the task detail. There is a link to edit the item, which takes you to a modal much like the original add item dialog. For admin users, there is also a link to delete the item. This view also shows the task's activity log on the right side of the screen, displaying the complete history of events related to the item.

![Task Image](http://taskboard.matthewross.me/docs/images/view-item2.png)

##Feedback

Constructive feedback is appreciated! If you have ideas for improvement, please [add an issue](https://github.com/kiswa/TaskBoard/issues) or submit a pull request.

If you find a bug, please post it on the [Issue Tracker](https://github.com/kiswa/TaskBoard/issues).

##Lines of Code

It's silly to use [LOC](http://en.wikipedia.org/wiki/Source_lines_of_code) as a metric, but it can be interesting to see what goes into a project.
This is only for TaskBoard files (library code is excluded), using [CLOC](http://cloc.sourceforge.net/).

Count was done from parent directory of TaskBoard as `./cloc-1.62.pl TaskBoard --exclude-dir=lib,api/lib`.

Language           | Files  | Blank Lines  | Comments | Code
-------------------|-------:|-------------:|---------:|---------:
Javascript         | 22     | 181          | 34       | 1837
HTML               | 17     | 7            | 8        | 936
PHP                | 6      | 143          | 55       | 834
CSS                | 1      | 12           | 33       | 609
Bourne Again Shell | 4      | 10           | 0        | 53
__SUM:__           | __50__ | __353__      | __130__  | __4269__

Counts Last Updated: Oct. 17, 2014
