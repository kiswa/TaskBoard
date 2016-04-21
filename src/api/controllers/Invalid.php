<?php
class Invalid extends BaseController {

    public function noApi($request, $response, $args) {
        $this->apiJson->addAlert('error',
            'No API functionality at this endpoint.');

        $apiReturn = new stdClass();
        $apiReturn->status = 'One of "success" or "failure".';
        $apiReturn->data = 'An array of data (JSON objects and/or arrays).';
        $apiReturn->alerts = 'An array of alerts, with "type" of "success", "error", "warn", or "info" and a "text" message.';

        $this->apiJson->addData($apiReturn);

        $this->logger->addInfo('Invalid Endpoint: ', [$this->apiJson]);

        return $this->jsonResponse($response);
    }

}

