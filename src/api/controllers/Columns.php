<?php
use RedBeanPHP\R;

class Columns extends BaseController {

    public function getColumn($request, $response, $args) {
        $column = new Column($this->container, (int)$args['id']);

        if ($column->id === 0) {
            $this->logger->addError('Attempt to load column ' .
                $args['id'] . ' failed.');
            $this->apiJson->addAlert('error', 'No column found for ID ' .
                $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($column);

        return $this->jsonResponse($response);
    }

    public function addColumn($request, $response, $args) {
        $column = new Column($this->container);
        $column->loadFromJson($request->getBody());

        if (!$column->save()) {
            $this->logger->addError('Add Column: ', [$column]);
            $this->apiJson->addAlert('error', 'Error adding column. ' .
                'Please try again.');
        }

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name added column ' . $column->name . '.',
            '', json_encode($column), 'column', $column->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Column ' .
            $column->name . 'added.');

        return $this->jsonResponse($response);
    }

    public function updateColumn($request, $response, $args) {
        $column = new Column($this->container, (int)$args['id']);
        $update = new Column($this->container);
        $update->loadFromJson($request->getBody());

        if ($column->id !== $update->id) {
            $this->logger->addError('Update Column: ', [$column, $update]);
            $this->apiJson->addAlert('error', 'Error updating column ' .
                $update->name . '. Please try again.');

            return $this->jsonResponse($response);
        }

        $update->save();

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name updated column ' . $update->name,
            json_encode($column), json_encode($update),
            'column', $update->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Column ' .
            $update->name . ' updated.');

        return $this->jsonResponse($response);
    }

    public function removeColumn($request, $response, $args) {
        $id = (int)$args['id'];
        $column = new Column($this->container, $id);

        if ($column->id !== $id) {
            $this->logger->addError('Remove Column: ', [$column]);
            $this->apiJson->addAlert('error', 'Error removing column. ' .
                'No column found for ID ' . $id . '.');

            return $this->jsonResponse($response);
        }

        $before = $column;
        $column->delete();

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name removed column ' . $before->name,
            json_encode($before), '', 'column', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Column ' . $before->name . ' removed.');

        return $this->jsonResponse($response);
    }
}

