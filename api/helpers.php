<?php
use RedBeanPHP\R;
// Patch for when using nginx instead of apache, source: http://php.net/manual/en/function.getallheaders.php#84262
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = '';

        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(
                    str_replace('_', ' ', substr($name, 5))
                )))] = $value;
            }
        }

        return $headers;
    }
}

// Log an action. If $itemId is set, it is an item action.
function logAction($comment, $oldValue, $newValue, $itemId=null) {
    $activity = R::dispense('activity');
    $activity->comment = $comment;
    $activity->oldValue = json_encode($oldValue);
    $activity->newValue = json_encode($newValue);
    $activity->timestamp = time();
    $activity->itemId = $itemId;

    R::store($activity);
}

// Sets the JWT for the current user and stores in DB for lookup.
function setUserToken($user, $expires) {
    $token = JWT::encode(array(
        'exp' => time() + $expires,
        'uid' => $user->id
    ), getJwtKey());

    $dbToken = R::dispense('token');
    $dbToken->token = $token;

    if (null == $user->ownToken) {
        $user->ownToken = array();
    }
    $user->ownToken[] = $dbToken;

    R::store($user);
}

// Get the user making the current request.
function getUser() {
    global $jsonResponse;
    $gah = getallheaders();
    if (isset($gah['Authorization'])) {
        $hash = $gah['Authorization'];
        try {
            $payload = JWT::decode($hash, getJwtKey());
            $user = R::load('user', $payload->uid);

            if ($user->id) {
                return $user;
            }
        } catch (Exception $e) {}
    }

    $jsonResponse->addAlert('error', 'Unable to load user. Please try again.');
    return null;
}

function getUserByID($id) {
    try {
        $user = R::load('user', $id);

        if ($user->id) {
            return $user;
        }
    } catch (Exception $e) {}

    return null;
}

function getLaneByID($id) {
    try {
        $lane = R::load('lane', $id);

        if ($lane->id) {
            return $lane;
        }
    } catch (Exception $e) {}

    return null;
}

// Get all users.
function getUsers($sanitize = true) {
    try {
        $gah = getallheaders();
        $hash = $gah['Authorization'];
        $payload = JWT::decode($hash, getJwtKey());

        $users = R::findAll('user');
        if ($sanitize) {
            foreach($users as &$user) {
                sanitize($user);
            }
        }

        return $users;
    } catch (Exception $e) {}

    $jsonResponse->addAlert('error', 'Unable to load users. Please try again.');
    return null;
}

// Add a user to a board.
function addUserToBoard($boardId, $user) {
    if ($user->isAdmin) {
        $boards = R::findAll('board'); // DO NOT use getBoards here - it sanitizes the users which causes problems.
        foreach($boards as $board) {
            $board->sharedUser[] = $user;
            R::store($board);
        }
    } else {
        $board = R::load('board', $boardId);
        if ($board->id) {
            $board->sharedUser[] = $user;
            R::store($board);
        }
    }
}

// Get all boards.
function getBoards() {
    $user = getUser();
    $boards = R::find('board');

    foreach($boards as $board) {
        foreach($board->sharedUser as $boardUser) {
            sanitize($boardUser);
        }
    }

    $collapsedLanes = R::find('collapsed', ' user_id = ' . $user->id);
    foreach($boards as $board) {
        foreach($board->xownLane as $lane) {
            foreach($collapsedLanes as $collapsed) {
                if ($lane->id == $collapsed->lane_id) {
                    $lane->collapsed = true;
                }
            }
        }
    }

    if ($user->isAdmin) {
        return $boards;
    } else {
        $filteredBoards = array();
        foreach($boards as $board) {
            foreach($board->sharedUser as $boardUser) {
                if ($user->username == $boardUser->username) {
                    $filteredBoards[] = $board;
                }
            }
        }
        return $filteredBoards;
    }
}

// Finds the removed IDs for updating a board.
function getIdsToRemove($boardList, $dataList) {
    $retVal = array();
    foreach($boardList as $item) {
        $remove = true;
        foreach($dataList as $newItem) {
            if (intval($newItem->id) == $item->id) {
                $remove = false;
            }
        }
        if ($remove) {
            $retVal[] = $item->id;
        }
    }
    return $retVal;
}

// Load a board bean from provided data.
function loadBoardData($board, $data) {
    $board->name = $data->name;
    $board->active = true;

    $removeIds = getIdsToRemove($board->xownLane, $data->lanes);
    foreach($removeIds as $id) {
        unset($board->xownLane[$id]);
    }

    // R::load works like R::dispense if the id is not found.
    foreach($data->lanes as $item) {
        $lane = R::load('lane', $item->id);
        $lane->name = $item->name;
        $lane->position = intval($item->position);

        if (null == $lane->ownItems) {
            $lane->ownItems = array();
        }
        // New lane, add it to the board
        if (!$lane->id) {
            $board->xownLane[] = $lane;
        }
        R::store($lane);
    }

    $removeIds = getIdsToRemove($board->xownCategory, $data->categories);
    foreach($removeIds as $id) {
        unset($board->xownCategory[$id]);
    }
    foreach($data->categories as $item) {
        $category = R::load('category', $item->id);
        $category->name = $item->name;

        // New category, add it to the board.
        if (!$category->id) {
            $board->xownCategory[] = $category;
        }
        R::store($category);
    }

    // Add or remove users as selected.
    for($i = 1; $i < count($data->users); $i++) {
        $user = R::load('user', $i);
        if ($data->users[$i] && $user->id && !in_array($user, $board->sharedUser)) {
            $board->sharedUser[] = $user;
        } else {
            unset($board->sharedUser[$i]);
        }
    }

    // Add all admin users.
    foreach(getUsers(false) as $user) {
        if ($user->isAdmin && !in_array($user, $board->sharedUser)) {
            $board->sharedUser[] = $user;
        }
    }

    R::store($board);
}

// Clean a user bean for return to front-end.
function sanitize($user) {
    $user['salt'] = null;
    $user->ownToken = array();
    $user['password'] = null;
}

// Change username if available.
function updateUsername($user, $data) {
    global $jsonResponse;
    $nameTaken = R::findOne('user', ' username = ?', array($data->newUsername));

    if (null != $user && null == $nameTaken) {
        $user->username = $data->newUsername;
        $jsonResponse->addAlert('success', 'Username updated.');
    } else {
        $jsonResponse->addAlert('error', 'Username already in use.');
    }

    return $user;
}

// Change email if available.
function updateEmail($user, $data) {
    global $jsonResponse;
    $emailTaken = R::findOne('user', ' username = ?', array($data->newEmail));

    if (null != $user && null == $emailTaken) {
        $user->email = $data->newEmail;
        $jsonResponse->addAlert('success', 'Email updated.');
    } else {
        $jsonResponse->addAlert('error', 'Email already in use.');
    }

    return $user;
}

// Validate a provided JWT.
function validateToken($requireAdmin = false) {
    global $jsonResponse, $app;
    $retVal = false;

    if (checkDbToken()) {
        $retVal = true;
    } else {
        clearDbToken();
        $jsonResponse->message = 'Invalid token.';
        $app->response->setStatus(401);
    }

    if ($retVal && $requireAdmin) {
        $user = getUser();
        if (!$user->isAdmin) {
            clearDbToken();
            $jsonResponse->message = 'Insufficient user privileges.';
            $app->response->setStatus(401);
        }
    }

    return $retVal;
}

// Retrieve user's token from DB and compare to header token.
function checkDbToken() {
    $user = getUser();
    $isValid = false;

    if (null != $user) {
        $gah = getallheaders();
        if (isset($gah['Authorization'])) {
            $hash = $gah['Authorization'];

            foreach ($user->ownToken as $token) {
                if ($hash == $token->token) {
                    $isValid = true;
                }
            }
        }
    }

    return $isValid;
}

// Clear a user's token from the DB.
function clearDbToken() {
    $payload = null;
    $gah = getallheaders();
    try {

        $payload = JWT::decode($gah['Authorization'], getJwtKey());
    } catch (Exception $e) {}

    if (null != $payload) {
        $user = R::load('user', $payload->uid);
        if (0 != $user->id) {
            $hash = $gah['Authorization'];

            foreach ($user->ownToken as $token) {
                if ($hash == $token->token) {
                    R::trash($token);
                }
            }

            R::store($user);
        }
    }
}

// Get the application's JWT key (created on first run).
function getJwtKey() {
    $key = R::load('jwt', 1);

    if (!$key->id) {
        $key->token = password_hash(strval(time()), PASSWORD_BCRYPT);
        R::store($key);
    }

    return $key->token;
}

// If there are no users, create the admin user.
function createInitialUser() {
    if (!R::count('user')) {
        $admin = R::dispense('user');

        $admin->username = 'admin';
        $admin->isAdmin = true;
        $admin->logins = 0;
        $admin->lastLogin = time(); //date('Y-m-d H:i:s');
        $admin->defaultBoard = null;
        $admin->salt = password_hash($admin->username . time(), PASSWORD_BCRYPT);
        $admin->password = password_hash('admin', PASSWORD_BCRYPT, array('salt' => $admin->salt));
        $admin->email = '';

        $options = R::dispense('option');
        $options->tasksOrder = 0;
        $options->showAnimations = true;
        $options->showAssignee = true;

        $admin->ownOptions[] = $options;

        R::store($admin);
    }
}

// Gets the position for a new item in a column.
function getNextItemPosition($columnId) {
    $retVal = 0;
    $column = R::load('lane', $columnId);

    if ($column->id) {
        $options = R::exportAll(getUser()->ownOption);

        if ($options[0]['tasks_order'] == 1) {
            // Tasks at top of column.
            renumberItems($columnId, 0, false);
        } else {
            try {
                $retVal = $column->countOwn('item');
            } catch (Exception $e) {
                // Ignore, just means there are no items.
            }
        }
    }

    return $retVal;
}

function renumberItems($columnId, $itemPosition, $isRemoved = true) {
    $items = R::find('item', 'lane_id = ' . $columnId);

    foreach ($items as $item) {
        if ($item->position >= $itemPosition) {
            $item->position += $isRemoved ? -1 : 1;
            R::store($item);
        }
    }
}

function runAutoActions(&$item) {
    $lane = R::load('lane', $item->laneId);
    $board = R::load('board', $lane->boardId);

    foreach($board->ownAutoaction as $action) {
        switch($action->triggerId) {
            case 0: // Item moves to lane
            if ($item->laneId == $action->secondaryId) {
                updateItemFromAction($item, $action);
            }
            break;
            case 1: // Item assigned to user
            if ($item->assignee == $action->secondaryId ||
                ($action->secondaryId == 0 && $item->assignee == null)) {
                updateItemFromAction($item, $action);
            }
            break;
            case 2: // Item assigned to category
            if ($item->category == $action->secondaryId ||
                ($action->secondaryId == 0 && $item->category == null)) {
                updateItemFromAction($item, $action);
            }
            break;
        }
    }
}

function updateItemFromAction(&$item, $action) {
    switch($action->actionId) {
        case 0: // Set item color
        $item->color = $action->color;
        break;
        case 1: // Set item category
        $item->category = $action->categoryId;
        break;
        case 2: // Set item assignee
        $item->assignee = $action->assigneeId;
        break;
        case 3: // Clear item due date
        $item->dueDate = null;
        break;
    }
    R::store($item);
}


