<?php
use RedBeanPHP\R;

class Attachments extends BaseController {

    public function getAttachment($request, $response, $args) {
        $attachment =new Attachment($this->container, (int)$args['id']);

        if ($board->id === 0) {
            $this->logger->addError('Attempt to load attachment ' .
                $args['id'] . ' failed.');
            $this->apiJson->addAlert('error', 'No attachment found for ID ' .
                $args['id'] . '.');

            return $this->jsonResponse($response);
        }

        $this->apiJson->setSuccess();
        $this->apiJson->addData($attachment);

        return $this->jsonResponse($response);
    }

    public function addAttachment($request, $response, $args) {
        $attachment = new Attachment($this->container);
        $attachment->loadFromJson($request->getBody());

        if (!$attachment->save()) {
            $this->logger->addError('Add Attachment: ', [$attachment]);
            $this->apiJson->addAlert('error', 'Error adding attachment.' .
                'Please try again.');

            return $this->jsonResponse($response);
        }

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name added attachment.', '', json_encode($attachment),
            'attachment', $attachment->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Attachment added.');

        return $this->jsonResponse($response);
    }

    public function updateAttachment($request, $response, $args) {
        $attachment = new Attachment($this->container, (int)$args['id']);
        $update = new Attachment($this->container);
        $update->loadFromJson($request->getBody());

        if ($attachment->id !== $update->id) {
            $this->logger->addError('Update Attachment: ',
                [$attachment, $update]);
            $this->apiJson->addAlert('error', 'Error update attachment. ' .
                'Please try again.');

            return $this->jsonResponse($response);
        }

        $update->save();

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name update attachment ' . $attachment->name,
            json_encode($attachment), json_encode($update),
            'attachment', $attachment->id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success', 'Attachment ' .
            $attachment->name . ' updated.');

        return $this->jsonResponse($response);
    }

    public function removeAttachment($request, $response, $args) {
        $id = (int)$args['id'];
        $attachment = new Attachment($this->container, $id);

        if ($attachment->id !== $id) {
            $this->logger->addError('Remove Attachment: ', [$attachment]);
            $this->apiJson->addAlert('error', 'Error removing attachment. ' .
                'No attachment found for ID ' . $id . '.');

            return $this->jsonResponse($response);
        }

        $before = $attachment;
        $attachment->delete();

        // TODO: Get existing user to log user_id and name
        $this->dbLogger->logChange($this->container, 0,
            '$user->name removed attachment ' . $before->name,
            json_encode($before), '', 'attachment', $id);

        $this->apiJson->setSuccess();
        $this->apiJson->addAlert('success',
            'Attachment ' . $before->name . ' removed.');

        return $this->jsonResponse($response);
    }
}

