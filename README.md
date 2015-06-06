#TaskBoard

A [Kanban](http://en.wikipedia.org/wiki/Kanban_board)-inspired app for keeping track of things that need to get done.

The goal of TaskBoard is to provide a simple and clean interface to a functional and minimal application for keeping track of tasks. It's not trying to be the next Trello or LeanKit.

###How It's Made

1. Front end

 * [AngularJS](https://angularjs.org/) single-page app.

 * [ng-context-menu](https://github.com/ianwalter/ng-context-menu), [jQueryUI Datepicker](http://jqueryui.com/datepicker/), [Spectrum](http://bgrins.github.io/spectrum/) colorpicker, [(noty)](http://ned.im/noty/) notifications, [marked](https://github.com/chjj/marked) Markdown parser, and [-prefix-free](http://leaverou.github.io/prefixfree/) CSS prefix helper.

 * [Bootstrap](http://getbootstrap.com/) for base look and feel.

2. Back end

 * RESTful API written in PHP, using [Slim Framework](http://www.slimframework.com/) for routing and [RedBeanPHP](http://www.redbeanphp.com/) for database ORM. Also uses [PHPMailer](https://github.com/PHPMailer/PHPMailer) for sending emails.

 * Token-based authentication.

 * SQLite database.

##Installation

###Requirements
A web server running PHP with sqlite enabled. Developed and tested under Apache2 running PHP 5.5+.

The server must have `sqlite` and `php5-sqlite` installed, as well as the `rewrite` and `expires` Apache modules.

**Note:** For Apache v2.3.9 and later, virtual host for a site should have [`AllowOverride All`](http://httpd.apache.org/docs/2.4/mod/core.html#allowoverride) for TaskBoard root directory. Otherwise, .htaccess files will be completely ignored.

**Optional:** to build minimized JavaScript and CSS (Install step 3) you must have a jre installed, tested with `openjdk-7-jre` and `openjdk-8-jre`.

###Install

Installing TaskBoard is as easy as 1, 2, (3), 4!

**Note:** You can skip step 3 if you don't care about minification of JavaScript and CSS for a production environment!

1. Clone the repository directly where you want it, or clone and copy to it's final location.

        git clone https://github.com/kiswa/TaskBoard.git

2. Install the PHP dependencies via composer. Open `TaskBoard/build/` in a terminal and run `.composer.phar install`

3. Open `TaskBoard/build/` in a terminal and run `./build-all`.

4. Visit the site and log in with the username and password `admin` (and don't forget to change the password once you're in!).

**Note:** Ensure `TaskBoard/api/` is writable so the back end can do its job!

### Development instance

Now you can start a simple development environment with the php internal webserver.

`php -S 127.0.0.1:8080 devrouter.php`

After launching the internal webserver go to http://127.0.0.1:8080/

##Features

###Email

TaskBoard will email you (if you supply it with an email address) about changes in the following cases: Board Created, Board Updated, Item Created, Item Edited, Item Comment Created, and Item Comment Edited.

For now, it emails all users assigned to the related Board. There will be further work done on this to allow more fine-grained control of emails.

###Settings
The settings page allows normal users to see what boards they have access to and edit their user settings.

Admin users have the same, with the additional abilities of adding/editing users and boards, and viewing a log of all activity in TaskBoard.

![Settings Image](http://taskboard.matthewross.me/docs/images/settings-standard.png)

###Boards
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

Count was done from parent directory of TaskBoard as `./cloc-1.62.pl TaskBoard --exclude-dir=lib,vendor`.

Language           | Files  | Blank Lines  | Comments | Code
-------------------|-------:|-------------:|---------:|---------:
Javascript         | 23     | 220          | 34       | 2092
PHP                | 9      | 233          | 55       | 1216
HTML               | 24     | 12           | 10       | 1160
CSS                | 1      | 13           | 26       | 703
Bourne Again Shell | 4      | 12           | 0        | 58
JSON               | 1      | 0            | 0        | 17
XML                | 1      | 0            | 0        | 12
__SUM:__           | __63__ | __490__      | __125__  | __5258__

Counts Last Updated: Jun 6, 2015
