<?php
error_reporting(E_ERROR);

class TbGitHubImport {
    var $db;
    var $isNew;
    var $user;
    var $pass;
    var $repo;
    var $ch;
    var $api;
    var $projects;

    function __construct() {
        $this->ch = curl_init();
        $this->api = "https://api.github.com/";
    }

    function __destruct() {
        print "Closing 'taskboard.sqlite'...";
        $this->db->exec('PRAGMA foreign_keys = ON');
        $this->db->close();
        print " Done.\n";
    }

    function import() {
        $this->openDb();
        $this->getInfo();
        $this->loadData();
        $this->importData();
    }

    private function openDb() {
        print "Opening 'taskboard.sqlite'...";
        $this->isNew = !file_exists('taskboard.sqlite');

        if ($this->isNew) {
            print "\n File not found, creating...";
        }

        $this->db = new SQLite3('taskboard.sqlite');
        print " Done.\n";

        if ($this->isNew) {
            print "Creating tables...";
            $schema = file_get_contents('schema');
            $this->db->exec($schema);
            print " Done.\n";
        }

        $this->db->exec('PRAGMA foreign_keys = OFF');
    }

    private function getInfo() {
        $this->user = readline("Enter your GitHub user name: ");
        $this->pass = readline("Enter your GitHub password: ");
        $this->repo = readline("What repo do you want to export projects from? ");
    }

    private function loadData() {
        $options = array(
            CURLOPT_URL => $this->api . "repos/" . $this->user . "/" . $this->repo . "/projects",
            CURLOPT_USERAGENT => "Googlebot/2.1 (+http://www.google.com/bot.html)",
            CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_USERPWD => $this->user . ":" . $this->pass,
            CURLOPT_HTTPHEADER => array(
                'Accept: application/vnd.github.inertia-preview+json'
            )
        );
        curl_setopt_array($this->ch, $options);

        $data = json_decode(curl_exec($this->ch));
        $this->projects = [];

        foreach ($data as $project) {
            $this->projects[$project->id] =
                (object)array("id" => $project->id, "name" => $project->name);
        }

        print("Found " . count($this->projects) . " project" .
            (count($this->projects) === 1 ? "" : "s") . ".\n");

        foreach ($this->projects as $project) {
            print " Loading Project " . $project->name . "...\n";

            curl_setopt(
                $this->ch,
                CURLOPT_URL,
                $this->api . "projects/" . $project->id . "/columns"
            );
            $data = json_decode(curl_exec($this->ch));

            $columns = [];
            $colPos = 1;

            foreach ($data as $column) {
                print "  Loading Column " . $column->name . "...";

                $currentColumn = (object)array(
                    "id" => $column->id, "name" => $column->name, "position" => $colPos
                );
                $colPos++;

                curl_setopt(
                    $this->ch,
                    CURLOPT_URL,
                    $this->api . "projects/columns/" . $column->id . "/cards"
                );
                $cardData = json_decode(curl_exec($this->ch));

                $cards = [];
                $cardPos = 1;

                foreach ($cardData as $card) {
                    $cards[] = (object)array(
                        "id" => $card->id,
                        "title" => "Imported",
                        "color" => "#ffffe0",
                        "description" => $card->note,
                        "position" => $cardPos,
                        "column_id" => $column->id
                    );
                    $cardPos++;
                }

                $this->projects[$project->id]->columns[$column->id] = $currentColumn;
                $this->projects[$project->id]->columns[$column->id]->cards = $cards;

                print " Loaded " . ($cardPos - 1) . " cards (tasks).\n";
            }

            print " Loaded Project " . $project->name . ".\n";
        }
    }

    private function importData() {
        foreach($this->projects as $project) {
            print " Importing Project " . $project->name . "...\n";

            $exists = $this->db->querySingle('SELECT id FROM board WHERE name = "' .
                $project->name . '"');

            if (count($exists) === 0) {
                $stmt = $this->db->prepare('INSERT INTO board (name, is_active) ' .
                    'VALUES (:name, :is_active)');

                $stmt->bindValue(":name", $project->name);
                $stmt->bindValue(":is_active", true);

                if ($stmt->execute()) {
                    print "  Created board.\n";
                }
            }

            if ($this->isNew) {
                $stmt = $this->db->prepare('INSERT INTO user (username, security_level, ' .
                    'password_hash) VALUES (:uname, :secLev, :hash)');
                $stmt->bindValue(':uname', 'admin');
                $stmt->bindValue(':secLev', 1);
                $stmt->bindValue(':hash', password_hash('admin', PASSWORD_BCRYPT));

                if ($stmt->execute()) {
                    print "  Created default admin user.\n";
                }

                $adminId = $this->db->lastInsertRowID();
                $stmt = $this->db->prepare('INSERT INTO useroption (id, ' .
                    'new_tasks_at_bottom, show_animations, show_assignee, ' .
                    'multiple_tasks_per_row, language) VALUES (:id, :new, :anim, ' .
                    ':assign, :mult, :lang)');
                $stmt->bindValue(':id', $adminId);
                $stmt->bindValue(':new', true);
                $stmt->bindValue(':anim', true);
                $stmt->bindValue(':assign', true);
                $stmt->bindValue(':mult', false);
                $stmt->bindValue(':lang', 'en');

                $stmt->execute();

                $optId = $this->db->lastInsertRowID();
                $stmt = $this->db->prepare('UPDATE user SET user_option_id = ' . $optId .
                    ' WHERE id = ' . $adminId);
                $stmt->execute();
            }

            $boardId = $this->cleanupExistingTables($project->name);

            $users = $this->db->query('SELECT id FROM user WHERE security_level = 1');
            $stmt = $this->db->prepare('INSERT INTO board_user (user_id, board_id) '.
                'VALUES (:user_id, :board_id)');

            while ($user = $users->fetchArray()) {
                $stmt->bindValue(':user_id', $user['id']);
                $stmt->bindValue(':board_id', $boardId);

                $stmt->execute();
            }
            print "  Added admin user(s) to board.\n";

            $colCount = 0;
            $taskCount = 0;

            foreach ($project->columns as $column) {
                $stmt = $this->db->prepare('INSERT INTO column (name, position, board_id) ' .
                    'VALUES (:name, :pos, :board_id)');

                $stmt->bindValue(':name', $column->name);
                $stmt->bindValue(':pos', $column->position);
                $stmt->bindValue(':board_id', $boardId);

                $stmt->execute();
                $colCount++;
                $colId = $this->db->lastInsertRowID();

                $stmt = $this->db->prepare('INSERT INTO task (title, description, ' .
                    'color, position, column_id) VALUES (:title, :description, :color,' .
                    ':pos, :col_id)');
                foreach($column->cards as $card) {
                    $stmt->bindValue(':title', $card->title);
                    $stmt->bindValue(':description', $card->description);
                    $stmt->bindValue(':color', $card->color);
                    $stmt->bindValue(':pos', $card->position);
                    $stmt->bindValue(':col_id', $colId);

                    $stmt->execute();
                    $taskCount++;
                }
            }

            print "  Inserted " . $colCount . " columns, and " . $taskCount . " tasks.\n";
        }

        print " Done Importing.\n";
    }

    private function cleanupExistingTables($boardName) {
        $boardId = $this->db->querySingle('SELECT id FROM board ' .
            'WHERE name = "' . $boardName . '"');
        $this->db->exec('DELETE FROM board_user WHERE board_id = ' . $boardId);
        $columns = $this->db->query('SELECT id FROM column WHERE board_id = ' . $boardId);

        while ($col = $columns->fetchArray()) {
            $this->db->exec('DELETE FROM task WHERE column_id = ' . $col['id']);
        }

        $this->db->exec('DELETE FROM column WHERE board_id = ' . $boardId);

        return $boardId;
    }

}

$tb = new TbGitHubImport();
$tb->import();

