<?php
// Get the list of active boards
$app->get('/boards', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $jsonResponse->addBeans(getBoards());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Create new board.
$app->post('/boards', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $board = R::dispense('board');
        loadBoardData($board, $data);

        $actor = getUser();
        logAction($actor->username . ' added board ' . $board->name, null, $board->export());
        $jsonResponse->addBeans(getBoards());
        $jsonResponse->addAlert('success', 'New board ' . $board->name . ' created.');
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Update existing board.
$app->post('/boards/update', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $board = R::load('board', $data->boardId);
        if ($board->id) {
            $before = $board->export();
            loadBoardData($board, $data);
            $jsonResponse->addAlert('success', 'Board ' . $board->name . ' edited.');
            $actor = getUser();
            logAction($actor->username . ' updated board ' . $board->name, $before, $board->export());
        }
        $jsonResponse->addBeans(getBoards());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Remove a board.
$app->post('/boards/remove', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $board = R::load('board', $data->boardId);
        if ($board->id == $data->boardId) {
            $before = $board->export();
            foreach($board->sharedUser as $user) {
                if ($user->defaultBoard == $data->boardId) {
                    $user->defaultBoard = null;
                    R::store($user);
                }
            }
            R::trashAll($board->xownLane);
            R::trashAll($board->xownCategory);
            R::trash($board);
            R::exec('DELETE from board_user WHERE board_id = ?', [$data->boardId]);
            $jsonResponse->addAlert('success', 'Removed board ' . $board->name . '.');
            $actor = getUser();
            logAction($actor->username . ' removed board ' . $board->name, $before, null);
        }
        $jsonResponse->addBeans(getBoards());
        $jsonResponse->users = R::exportAll(getUsers());
    }
    $app->response->setBody($jsonResponse->asJson());
});

$app->post('/autoactions', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $board = R::load('board', $data->boardId);
        if ($board->id) {
            $autoAction = R::dispense('autoaction');
            $autoAction->triggerId = $data->triggerId;
            $autoAction->secondaryId = $data->secondaryId;
            $autoAction->actionId = $data->actionId;
            $autoAction->color = $data->color;
            $autoAction->categoryId = $data->categoryId;
            $autoAction->assigneeId = $data->assigneeId;
        }
        $board->ownAutoaction[] = $autoAction;
        R::store($board);
        $jsonResponse->addAlert('success', 'Automatic action created.');
        $actions = R::findAll('autoaction');
        $jsonResponse->addBeans($actions);
    }
    $app->response->setBody($jsonResponse->asJson());
});

$app->get('/autoactions', function() use($app, $jsonResponse) {
    if (validateToken()) {
        $actions = R::findAll('autoaction');
        $jsonResponse->addBeans($actions);
    }
    $app->response->setBody($jsonResponse->asJson());
});

$app->post('/autoactions/remove', function() use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $autoAction = R::load('autoaction', $data->actionId);
        R::trash($autoAction);

        $actions = R::findAll('autoaction');
        $jsonResponse->addBeans($actions);
        $jsonResponse->addAlert('success', 'Automatic action removed.');
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Toggle the expand/collapse state of a lane for the current user.
$app->post('/lanes/:laneId/toggle', function($laneId) use($app, $jsonResponse) {
    if (validateToken()) {
        $user = getUser();
        $lane = R::load('lane', $laneId);
        $collapsed = R::findOne('collapsed', ' user_id = ? AND lane_id = ? ', [$user->id, $laneId]);

        if (null != $collapsed) {
            R::trash($collapsed);
            $jsonResponse->message = 'Expanded lane ' . $lane->name;
        } else {
            $collapsed = R::dispense('collapsed');
            $collapsed->userId = $user->id;
            $collapsed->laneId = $laneId;
            R::store($collapsed);
            $jsonResponse->message = 'Collapsed lane ' . $lane->name;
        }

        $jsonResponse->addBeans(getBoards());
    }
    $app->response->setBody($jsonResponse->asJson());
})->conditions(['laneId' => '\d+']); // Numbers only.
