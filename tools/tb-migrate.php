<?php

class TbMigrate {
    var $oldDb;
    var $newDb;

    function __construct() {
        print "Opening 'taskboard.db'...";
        try {
            $this->oldDb = new SQLite3('taskboard.db', SQLITE3_OPEN_READONLY);
            print "\t\tDone.\n";
        } catch (Exception $e) {
            print "\t\tError opening 'taskboard.db'\n";
            print "  " . $e->getMessage() . "\n";
            die();
        }

        print "Opening 'taskboard.sqlite'...";
        try {
            unlink('taskboard.sqlite'); // Always start fresh.

            $this->newDb = new SQLite3('taskboard.sqlite');
            print "\t\tDone.\n\n";
        } catch (Exception $e) {
            print "\t\tError creating 'taskboard.sqlite'\n";
            print "  " . $e->getMessage() . "\n";
            die();
        }
    }

    function __destruct() {
        print "\n";
        print "Closing 'taskboard.sqlite'...";
        $this->newDb->exec('PRAGMA foreign_keys = ON');
        $this->newDb->close();
        print "\t\tDone.\n";

        print "Closing 'taskboard.db'...";
        $this->oldDb->close();
        print "\t\tDone.\n";
    }

    function migrate() {
        $this->createTables();

        $this->migrateActivity();
        // TODO: attachments table
        $this->migrateAutoAction();
        $this->migrateBoard();
        $this->migrateBoardUser();
        $this->migrateCategory();
        $this->migrateCollapsed();
        $this->migrateComment();
        $this->migrateItem();
        $this->migrateLane();
        $this->migrateUser();
    }

    private function createTables() {
        print " Creating new tables...";
        $schema = file_get_contents('schema');

        $this->newDb->exec($schema);
        $this->newDb->exec('PRAGMA foreign_keys = OFF');
        print "\t\t\tDone.\n\n";
    }

    private function getItemType($str) {
        if (strpos($str, 'item') !== false) {
            return 'task';
        }

        if (strpos($str, 'column') !== false) {
            return 'column';
        }

        if (strpos($str, 'board') !== false) {
            return 'board';
        }

        if (strpos($str, 'changed') !== false || strpos($str, 'logged') !== false ||
            strpos($str, 'added') !== false || strpos($str, 'removed') !== false) {
            return 'user';
        }

        return null;
    }

    private function getItemId($itemId, $newValue) {
        if (isset($itemId)) {
            return $itemId;
        }

        $obj = json_decode($newValue);

        if ($obj !== null) {
            return $obj->id;
        }

        return null;
    }

    private function getActionType($row) {
        switch ($row['action_id']) {
        case 0:
            return 1;
            break;
        case 2:
            return 4;
            break;
        case 3:
            return 6;
            break;
        default:
            return null;
        }
    }

    private function getActionChange($row) {
        if (isset($row['color'])) {
            return $row['color'];
        }

        if (isset($row['category_id'])) {
            return $row['category_id'];
        }

        if (isset($row['assignee_id'])) {
            return $row['assignee_id'];
        }

        return null;
    }

    private function migrateTable($stmtStr, $fn, $oldTable = null) {
        $table = isset($oldTable) ? $oldTable : explode(' ', $stmtStr)[2];

        print " Migrating table `$table`...";

        $results = $this->oldDb->query("SELECT * from $table ORDER BY id");

        if ($results->numColumns() === 0) {
            print " no rows.\n";
            return;
        }

        $stmt = $this->newDb->prepare($stmtStr);
        $rowCount = 0;
        $errCount = 0;

        while ($row = $results->fetchArray()) {
            $fn($stmt, $row);

            if ($stmt->execute() === false) {
                $errCount++;
                continue;
            }

            $rowCount++;
        }

        $stmt->close();
        print strlen($table) < 10 ? "\t" : "";
        print "\t$rowCount rows migrated.\n";

        if ($errCount > 0) {
            print " $errCount rows failed.\n";
        }
    }

    private function migrateActivity() {
        $stmtStr = 'INSERT INTO activity (id, user_id, log_text, before, after, ' .
            'item_type, item_id, timestamp) VALUES (:id, :user_id, :log_text, ' .
            ':before, :after, :item_type, :item_id, :timestamp)';
        $knownNames = [];

        $this->migrateTable($stmtStr, function(&$stmt, $row) use ($knownNames) {
            $name = explode(' ', $row['comment'])[0];

            if (!array_key_exists($name, $knownNames)) {
                $usr = $this->oldDb->query('SELECT id FROM user ' .
                    'WHERE username = "' . $name . '"');

                $knownNames[$name] = $usr->fetchArray()['id'];
            }

            $type = $this->getItemType($row['comment']);

            $stmt->bindValue(':id', $row['id']);
            $stmt->bindValue(':user_id', $knownNames[$name]);
            $stmt->bindValue(':log_text', $row['comment']);
            $stmt->bindValue(':before', $row['old_value']);
            $stmt->bindValue(':after', $row['new_value']);
            $stmt->bindValue(':item_type', $type);
            $stmt->bindValue(':item_id', $type === 'user'
                ? $knownNames[$name]
                : $this->getItemId($row['item_id'], $row['new_value']));
            $stmt->bindValue(':timestamp', $row['timestamp']);
        });
    }

    private function migrateAutoAction() {
        $stmtStr = 'INSERT INTO autoaction (id, trigger, source_id, type, ' .
            'change_to, board_id) VALUES (:id, :trigger, :source_id, :type, ' .
            ':change_to, :board_id)';

        $this->migrateTable($stmtStr, function (&$stmt, $row) {
            $stmt->bindValue(':id', $row['id']);
            $stmt->bindValue(':trigger', ((int)$row['trigger_id']) + 1);
            $stmt->bindValue(':source_id', $row['secondary_id']);
            $stmt->bindValue(':type', $this->getActionType($row));
            $stmt->bindValue(':change_to', $this->getActionChange($row));
            $stmt->bindValue(':board_id', $row['board_id']);
        });
    }

    private function migrateBoard() {
        $stmtStr = 'INSERT INTO board (id, name, is_active) ' .
            'VALUES (:id, :name, :is_active)';

        $this->migrateTable($stmtStr, function (&$stmt, $row) {
            $stmt->bindValue(':id', $row['id']);
            $stmt->bindValue(':name', $row['name']);
            $stmt->bindValue(':is_active', $row['active']);
        });
    }

    private function migrateBoardUser() {
        $stmtStr = 'INSERT INTO board_user (id, user_id, board_id) ' .
            'VALUES (:id, :user_id, :board_id)';

        $this->migrateTable($stmtStr, function (&$stmt, $row) {
            $stmt->bindValue(':id', $row['id']);
            $stmt->bindValue(':user_id', $row['user_id']);
            $stmt->bindValue(':board_id', $row['board_id']);
        });
    }

    private function migrateCategory() {
        $stmtStr = 'INSERT INTO category (id, name, default_task_color, board_id) ' .
            'VALUES (:id, :name, "#ffffe0", :board_id)';

        $this->migrateTable($stmtStr, function (&$stmt, $row) {
            $stmt->bindValue(':id', $row['id']);
            $stmt->bindValue(':name', $row['name']);
            $stmt->bindValue(':board_id', $row['board_id']);
        });
    }

    private function migrateCollapsed() {
        $stmtStr = 'INSERT INTO collapsed (id, user_id, column_id) ' .
            'VALUES (:id, :user_id, :column_id)';

        $this->migrateTable($stmtStr, function (&$stmt, $row) {
            $stmt->bindValue(':id', $row['id']);
            $stmt->bindValue(':user_id', $row['user_id']);
            $stmt->bindValue(':column_id', $row['lane_id']);
        });
    }

    private function migrateComment() {
        $stmtStr = 'INSERT INTO comment (id, text, user_id, task_id, timestamp, ' .
            'is_edited) VALUES (:id, :text, :user_id, :task_id, :timestamp, 0)';

        $this->migrateTable($stmtStr, function (&$stmt, $row) {
            $stmt->bindValue(':id', $row['id']);
            $stmt->bindValue(':text', $row['text']);
            $stmt->bindValue(':user_id', $row['user_id']);
            $stmt->bindValue(':task_id', $row['item_id']);
            $stmt->bindValue(':timestamp', $row['timestamp']);
        });
    }

    private function migrateItem() {
        $stmtStr = 'INSERT INTO task (id, title, description, color, due_date, ' .
            'points, position, column_id) VALUES (:id, :title, :description, :color, ' .
            ':due_date, :points, :position, :column_id)';

        $this->migrateTable($stmtStr, function (&$stmt, $row) {
            $stmt->bindValue(':id', $row['id']);
            $stmt->bindValue(':title', $row['title']);
            $stmt->bindValue(':description', $row['description']);
            $stmt->bindValue(':color', $row['color']);
            $stmt->bindValue(':due_date', $row['due_date']);
            $stmt->bindValue(':points', $row['points']);
            $stmt->bindValue(':position', $row['position']);
            $stmt->bindValue(':column_id', $row['lane_id']);

            $this->newDb->exec('INSERT INTO task_user (user_id, task_id) ' .
                'VALUES (' . $row['assignee'] . ', ' . $row['id'] . ')');
            $this->newDb->exec('INSERT INTO category_task (category_id, task_id) ' .
                'VALUES (' . $row['category'] . ', ' . $row['id'] . ')');
        }, 'item', function ($lastId, $row) {
        });
    }

    private function migrateLane() {
        $stmtStr = 'INSERT INTO column (id, name, position, board_id) ' .
            'VALUES (:id, :name, :position, :board_id)';

        $this->migrateTable($stmtStr, function (&$stmt, $row) {
            $stmt->bindValue(':id', $row['id']);
            $stmt->bindValue(':name', $row['name']);
            $stmt->bindValue(':position', $row['position']);
            $stmt->bindValue(':board_id', $row['board_id']);
        }, 'lane');
    }

    private function migrateOption() {
        $stmtStr = 'INSERT INTO useroption (id, new_tasks_at_bottom, ' .
            'show_animations, show_assignee, multiple_tasks_per_row, language) ' .
            'VALUES (:id, :atBottom, :anims, :assignee, 0, "en")';

        $this->migrateTable($stmtStr, function (&$stmt, $row) {
            $stmt->bindValue(':id', $row['id']);
            $stmt->bindValue(':atBottom', isset($row['tasks_order'])
                ? $row['tasks_order']
                : $row['new_task_position']);
            $stmt->bindValue(':anims', isset($row['animate'])
                ? $row['animate']
                : $row['show_animations']);
            $stmt->bindValue(':assignee', isset($row['show_assignee'])
                ? $row['show_assignee']
                : 1);
        }, 'option');
    }

    private function migrateUser() {
        $stmtStr = 'INSERT INTO user (id, username, security_level, password_hash, ' .
            'email, default_board_id, user_option_id, last_login) VALUES (:id, ' .
            ':uname, :secLev, :hash, :email, :board, :option, :last)';

        $this->migrateTable($stmtStr, function (&$stmt, $row) {
            $stmt->bindValue(':id', $row['id']);
            $stmt->bindValue(':uname', $row['username']);
            $stmt->bindValue(':secLev', $row['is_admin'] === 1 ? 1 : 3);
            $stmt->bindValue(':hash', $row['password']);
            $stmt->bindValue(':email', $row['email']);
            $stmt->bindValue(':board', $row['default_board']);
            $stmt->bindValue(':option', $row['id']);
            $stmt->bindValue(':last', $row['last_login']);
        });

        $users = $this->newDb->query('SELECT id FROM user ORDER BY id');

        while ($row = $users->fetchArray()) {
            $stmt = $this->newDb->prepare('INSERT INTO useroption (id, ' .
                'new_tasks_at_bottom, show_animations, show_assignee, ' .
                'multiple_tasks_per_row, language) VALUES (:id, :atBottom, :anims, ' .
                ':assignee, 0, "en")');

            $opts = $this->oldDb->query(
                'SELECT * FROM option WHERE id = ' . (int)$row['id']
            );
            $opts = $opts->fetchArray();

            if ($opts === false) {
                continue;
            }

            $stmt->bindValue(':id', $opts['id']);
            $stmt->bindValue(':atBottom', isset($opts['tasks_order'])
                ? $opts['tasks_order']
                : $opts['new_task_position']);
            $stmt->bindValue(':anims', isset($opts['animate'])
                ? $opts['animate']
                : $opts['show_animations']);
            $stmt->bindValue(':assignee', isset($opts['show_assignee'])
                ? $opts['show_assignee']
                : 1);

            $stmt->execute();
        }

        $stmt->close();
    }

}

$tbm = new TbMigrate();
$tbm->migrate();

