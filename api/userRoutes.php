<?php
use RedBeanPHP\R;
// Validate a user and store token (and return in response).
$app->post('/login', function() use ($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    $expires = ($data->rememberme)
        ? (2 * 7 * 24 * 60 * 60) /* Two weeks */
        : (1.5 * 60 * 60) /* One and a half hours */;

    $lookup = R::findOne('user', ' username = ? ', [$data->username]);

    $jsonResponse->message = 'Invalid username or password.';
    $app->response->setStatus(401);

    if (null != $lookup) {
        $hash = password_hash($data->password, PASSWORD_BCRYPT, array('salt' => $lookup->salt));
        if ($lookup->password == $hash) {
            if ($lookup->logins == 0 && $lookup->username == 'admin') {
                $jsonResponse->addAlert('warning', "This is your first login, don't forget to change your password.");
                $jsonResponse->addAlert('success', 'Go to Settings to add your first board.');
            }
            setUserToken($lookup, $expires);
            $lookup->logins = $lookup->logins + 1;
            $lookup->lastLogin = time();
            R::store($lookup);

            logAction($lookup->username . ' logged in.', null, null);
            $jsonResponse->message = 'Login successful.';
            $jsonResponse->data = R::findOne('token', ' user_id = ? ORDER BY id DESC ', [$lookup->id])->token;
            $app->response->setStatus(200);
        }
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Log out a user by clearing tokens.
$app->get('/logout', function() use ($app, $jsonResponse) {
    if (validateToken()) {
        clearDbToken();
        $jsonResponse->message = 'Logout complete.';
        $actor = getUser();
        logAction($actor->username . ' logged out.', null, null);
    }
    $app->response->setStatus(200); // Doesn't matter if the token was no good.
    $app->response->setBody($jsonResponse->asJson());
});

// Update current user's password.
$app->post('/updatepassword', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $user = getUser();
        if (null != $user) {
            $checkPass = password_hash($data->currentPass, PASSWORD_BCRYPT, array('salt' => $user->salt));
            if ($user->password == $checkPass) {
                $before = $user->export();
                $user->password = password_hash($data->newPass, PASSWORD_BCRYPT, array('salt' => $user->salt));
                R::store($user);

                logAction($user->username . ' changed their password.', $before, $user->export());
                $jsonResponse->addAlert('success', 'Password changed.');
            } else {
                $jsonResponse->addAlert('error', 'Invalid current password. Password not changed.');
            }
        }
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Update current user's username if not taken.
$app->post('/updateusername', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $user = getUser();
        $before = $user->export();
        $user = updateUsername($user, $data);
        R::store($user);

        if ($jsonResponse->alerts[0]['type'] == 'success') {
            logAction($before['username'] . ' changed username to ' . $user->username, $before, $user->export());
        }
        $jsonResponse->addBeans(getUsers());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Update current user's email if not taken.
$app->post('/updateemail', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $user = getUser();
        $before = $user->export();
        $user = updateEmail($user, $data);
        R::store($user);

        if ($jsonResponse->alerts[0]['type'] == 'success') {
            logAction($before['username'] . ' changed email to ' . $user->email, $before, $user->export());
        }
        $jsonResponse->addBeans(getUsers());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Update current user's default board.
$app->post('/updateboard', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $user = getUser();
        $before = $user->export();
        $user->defaultBoard = $data->defaultBoard;

        R::store($user);

        logAction($user->username . ' changed their default board.', $before, $user->export());
        $jsonResponse->addBeans(getUsers());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Get all user actions
$app->get('/actions', function() use($app, $jsonResponse) {
    if (validateToken(true)) {
        $actions = R::findAll('activity', ' order by timestamp desc ');
        $jsonResponse->addBeans($actions);
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Get current user
$app->get('/users/current', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $user = getUser();
        if (null != $user) {
            $userOptions = R::exportAll($user->ownOption);
            $options = [
                'tasksOrder' => $userOptions[0]['tasks_order'],
                'showAssignee' => $userOptions[0]['show_assignee'] == 1,
                'showAnimations' => $userOptions[0]['show_animations'] == 1
            ];
            $jsonResponse->data = [
                'userId' => $user->id,
                'username' => $user->username,
                'isAdmin' => $user->isAdmin,
                'email' => $user->email,
                'defaultBoard' => $user->defaultBoard,
                'options' => $options
            ];
        }
    }
    $app->response->setBody($jsonResponse->asJson());
});

$app->post('/users/current/options', function() use ($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $user = getUser();

        $user->ownOption[1]->tasksOrder = $data->tasksOrder;
        $user->ownOption[1]->showAssignee = $data->showAssignee;
        $user->ownOption[1]->showAnimations = $data->showAnimations;
        R::store($user);

        $jsonResponse->data = $data;
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Get all users
$app->get('/users', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->addBeans(getUsers());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Create a new user
$app->post('/users', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $nameTaken = R::findOne('user', ' username = ?', [$data->username]);

        if (null != $nameTaken) {
            $jsonResponse->addAlert('error', 'Username already in use.');
        } else {
            $user = R::dispense('user');
            $user->username = $data->username;
            $user->isAdmin = $data->isAdmin;
            $user->email = $data->email;
            $user->defaultBoard = $data->defaultBoard;
            $user->salt = password_hash($data->username . time(), PASSWORD_BCRYPT);
            $user->password = password_hash($data->password, PASSWORD_BCRYPT, array('salt' => $user->salt));
            $options = R::dispense('option');
            $options->newTaskPosition = 0; // Bottom of column (1 == top of column)
            $options->animate = true;
            $user->ownOptions = $options;

            R::store($user);
            addUserToBoard($data->defaultBoard, $user);
            foreach($data->boardAccess as $board) {
                addUserToBoard($board, $user);
            }

            $actor = getUser();
            logAction($actor->username . ' added user ' . $user->username, null,  $user->export());
            $jsonResponse->addAlert('success', 'New user ' . $user->username . ' created.');
        }
        $jsonResponse->addBeans(getUsers());
        $jsonResponse->boards = R::exportAll(getBoards());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Update a user
$app->post('/users/update', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $user = R::load('user', $data->userId);
        $actor = getUser();
        if ($user->id && $actor->isAdmin) {
            $before = $user->export();
            if ($data->newUsername != $user->username) {
                $user = updateUsername($user, $data);
            }
            if ($data->password != '' && $data->password != null) {
                $user->password = password_hash($data->password, PASSWORD_BCRYPT, array('salt' => $user->salt));
            }
            $user->isAdmin = $data->isAdmin;
            $user->email = $data->email;
            $user->defaultBoard = $data->defaultBoard;

            R::store($user);
            addUserToBoard($data->defaultBoard, $user);
            foreach($data->boardAccess as $board) {
                addUserToBoard($board, $user);
            }

            logAction($actor->username . ' updated user ' . $user->username, $before,  $user->export());
            $jsonResponse->addAlert('success', 'User updated.');
        }
        $jsonResponse->addBeans(getUsers());
        $jsonResponse->boards = R::exportAll(getBoards());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Remove a user.
$app->post('/users/remove', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $user = R::load('user', $data->userId);
        $actor = getUser();
        if ($user->id == $data->userId && $actor->isAdmin) {
            $before = $user->export();
            R::trash($user);
            R::exec('DELETE from board_user WHERE user_id = ?', [$data->userId]);

            logAction($actor->username . ' removed user ' . $before['username'], $before, null);
            $jsonResponse->addAlert('success', 'Removed user ' . $user->username . '.');
        }
        $jsonResponse->addBeans(getUsers());
        $jsonResponse->boards = R::exportAll(getBoards());
    }
    $app->response->setBody($jsonResponse->asJson());
});
