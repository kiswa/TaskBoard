<?php
// Provides default structure and JSON encoded response for the API.
class JsonResponse {
    var $message;
    var $data;
    var $alerts;

    function asJson() {
        return json_encode($this);
    }

    function addBeans($beans) {
        if (null == $beans) return array();

        $this->data = R::exportAll($beans);
    }

    function addAlert($type, $text) {
        $this->alerts[] = ['type' => $type, 'text' => $text];
    }
}
