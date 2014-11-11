<?php
// Create new item
$app->post('/boards/:id/items', function($id) use($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $board = R::load('board', $id);
        if ($board->id) {
            $item = R::dispense('item');
            $item->title = $data->title;
            $item->description = $data->description;
            $item->assignee = $data->assignee;
            $item->category = $data->category;
            $item->color = $data->color;
            $item->dueDate = $data->dueDate;
            $item->points = $data->points;
            $item->position = getNextItemPosition($data->lane);

            $board->xownLane[$data->lane]->xownItem[] = $item;
            R::store($board);
            runAutoActions($item);

            if ($item->id) {
                $actor = getUser();
                logAction($actor->username . ' added item ' . $item->title . ' to board ' . $board->name,
                          null, $item->export(), $item->id);
                $jsonResponse->addAlert('success', 'New board item created.');
                $jsonResponse->addBeans(getBoards());
            } else {
                $jsonResponse->addAlert('error', 'Failed to create board item.');
            }
        }
    }
    $app->response->setBody($jsonResponse->asJson());
})->conditions(['id' => '\d+']); // Numbers only.

//Update existing item
$app->post('/items/:itemId', function($itemId) use ($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $user = getUser();
        $item = R::load('item', $itemId);
        $before = $item->export();
        if ($item->id) {
            $item->title = $data->title;
            $item->description = $data->description;
            $item->assignee = $data->assignee;
            $item->category = $data->category;
            $item->color = $data->color;
            $item->dueDate = $data->dueDate;
            $item->points = $data->points;
            if ($data->lane != $item->lane_id) {
                $item->position = getNextItemPosition($data->lane);
                $item->lane = R::load('lane', $data->lane);
            } else {
                $item->position = $data->position;
            }

            runAutoActions($item);
            R::store($item);
            logAction($user->username . ' updated item ' . $item->title, $before, $item->export(), $itemId);
            $jsonResponse->addAlert('success', 'Updated item ' . $item->title . '.');
            $jsonResponse->addBeans(getBoards());
        }
    }
    $app->response->setBody($jsonResponse->asJson());
})->conditions(['itemId' => '\d+']);

// Update item positions
$app->post('/items/positions', function() use ($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $user = getUser();
        $movedItem = null;
        $beforeItem = null;
        $afterItem = null;
        R::begin();
        foreach($data->positions as $posItem) {
            $item = R::load('item', $posItem->item);
            $before = $item->export();
            $oldLane = $item->lane->id;
            $item->lane = R::load('lane', $posItem->lane);
            if ($oldLane != $item->lane->id) {
                $movedItem = $item;
                $beforeItem = $before;
                $afterItem = $item->export();
            }
            $item->position = $posItem->position;

            runAutoActions($item);
            R::store($item);
        }
        R::commit();

        // If an item changed lanes, log the action.
        if (null != $movedItem) {
            logAction($user->username . ' moved item ' . $movedItem->title . ' to lane ' . $movedItem->lane->name,
                      $beforeItem, $afterItem, $movedItem->id);
        }
        $jsonResponse->addBeans(getBoards());
    }
    $app->response->setBody($jsonResponse->asJson());
});

// Add a comment to an item.
$app->post('/items/:itemId/comment', function($itemId) use ($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $user = getUser();
        $item = R::load('item', $itemId);
        if ($item->id) {
            $comment = R::dispense('comment');
            $comment->text = $data->text;
            $comment->userId = $user->id;
            $comment->timestamp = time();

            $item->ownComment[] = $comment;
            R::store($item);

            logAction($user->username . ' added a comment to item ' . $item->title, null, $comment->export(), $itemId);
            $jsonResponse->addAlert('success', 'Comment added to item ' . $item->title . '.');
            $jsonResponse->addBeans(R::load('item', $itemId));
        }
    }
    $app->response->setBody($jsonResponse->asJson());
})->conditions(['itemId' => '\d+']);

// Update an existing comment
$app->post('/comments/:commentId', function($commentId) use ($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if(validateToken()) {
        $user = getUser();
        $comment = R::load('comment', $commentId);
        $before = $comment->export();

        $comment->text = $data->text;
        $comment->userId = $user->id;
        $comment->timestamp = time();
        $comment->isEdited = true;
        R::store($comment);

        logAction($user->username . ' edited comment ' . $comment->id, $before, $comment->export(), $comment->id);
        $jsonResponse->addAlert('success', 'Comment edited.');
        $jsonResponse->addBeans(R::load('item', $comment->item_id));
    }
    $app->response->setBody($jsonResponse->asJson());
})->conditions(['commentId' => '\d+']);

// Remove a comment from an item.
$app->post('/items/:itemId/comment/remove', function($itemId) use ($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $user = getUser();
        $comment = R::load('comment', $data->id);
        if ($comment->id) {
            $before = $comment->export();
            R::trash($comment);

            $item = R::load('item', $itemId);
            logAction($user->username . ' removed comment from item ' . $item->title . '.', $before, null, $item->id);
            $jsonResponse->addAlert('success', 'Comment was deleted.');
            $jsonResponse->addBeans(R::load('item', $itemId));
        }
    }
    $app->response->setBody($jsonResponse->asJson());
})->conditions(['itemId' => '\d+']);

// Add an attachment to an item.
$app->post('/items/:itemId/upload', function($itemId) use ($app, $jsonResponse) {
    $upload = $_FILES['file'];
    if (!file_exists('uploads/')) {
        mkdir('uploads', 0777, true);
    }

    if (validateToken()) {
        $file = R::dispense('attachment');
        $item = R::load('item', $itemId);
        $before = $item->export();
        $user = getUser();

        $file->filename = sha1($upload['tmp_name']);
        $file->name = $upload['name'];
        $file->type = $upload['type'];
        $file->userId = $user->id;
        $file->timestamp = time();

        $item->ownAttachment[] = $file;
        R::store($item);

        move_uploaded_file($upload['tmp_name'], 'uploads/' . $file->filename);

        logAction($user->username . ' uploaded attachment ' . $file->name . ' to item ' . $item->name,
                  $before, $item, $itemId);
        $jsonResponse->addAlert('success', $file->name . ' was added.');
        $jsonResponse->addBeans($item);
    }
    $app->response->setBody($jsonResponse->asJson());
})->conditions(['itemId' => '\d+']);

// Get an item attachment's information.
$app->get('/items/:itemId/upload/:attachmentId', function($itemId, $attachmentId) use ($app, $jsonResponse) {
    if (validateToken()) {
        $file = R::load('attachment', $attachmentId);

        if ($file->id) {
            $file->username = 'unknown';
            $user = R::load('user', $file->userId);
            if ($user->id) {
                $file->username = $user->username;
            }
            $jsonResponse->addBeans($file);
        }
    }
    $app->response->setBody($jsonResponse->asJson());
})->conditions(['itemId' => '\d+', 'attachmentId' => '\d+']);

// Remove an attachment from an item.
$app->post('/items/:itemId/upload/remove', function($itemId) use ($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken()) {
        $item = R::load('item', $itemId);
        $before = $item->export();
        $actor = getUser();

        $file = R::load('attachment', $data->fileId);
        if ($file->id) {
            $filename = $file->name;
            $before = $item->export();
            unlink('uploads/' . $file->filename);
            R::trash($file);
            R::store($item);

            logAction($actor->username . ' removed attachment ' . $filename . ' from item ' . $item->title,
                      $before, $item, $itemId);
            $jsonResponse->addAlert('success', $filename . ' was deleted.');
            $jsonResponse->addBeans($item);
        }
    }
    $app->response->setBody($jsonResponse->asJson());
})->conditions(['itemId' => '\d+']);

// Remove an item.
$app->post('/items/remove', function() use ($app, $jsonResponse) {
    $data = json_decode($app->environment['slim.input']);

    if (validateToken(true)) {
        $item = R::load('item', $data->itemId);
        if ($item->id) {
            $before = $item->export();
            R::trash($item);

            $actor = getUser();
            logAction($actor->username . ' removed item ' . $item->title, $before, null, $data->itemId);
            $jsonResponse->addAlert('success', $item->title . ' was deleted.');
            $jsonResponse->addBeans(getBoards());
        }
    }
    $app->response->setBody($jsonResponse->asJson());
});
