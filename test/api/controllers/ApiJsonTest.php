<?php
class ApiJsonTest extends PHPUnit_Framework_TestCase {
    public function testCreateApiJson() {
        $apiJson = new ApiJson();

        $this->assertEquals('failure', $apiJson->status);
        $this->assertArraySubset($apiJson->data, []);
        $this->assertArraySubset($apiJson->alerts, []);
    }

    public function testSetSuccess() {
        $apiJson = new ApiJson();
        $this->assertEquals('failure', $apiJson->status);

        $apiJson->setSuccess();
        $this->assertEquals('success', $apiJson->status);
    }

    public function testSetFailure() {
        $apiJson = new ApiJson();
        $apiJson->setSuccess();
        $this->assertEquals('success', $apiJson->status);

        $apiJson->setFailure();
        $this->assertEquals('failure', $apiJson->status);
    }

    public function testAddData() {
        $apiJson = new ApiJson();

        $obj = new stdClass();
        $obj->id = 1;

        $apiJson->addData($obj);
        $this->assertArraySubset($apiJson->data, [$obj]);
    }

    public function testAddAlert() {
        $apiJson = new ApiJson();

        $alert = new stdClass();
        $alert->type = 'success';
        $alert->text = 'Test message.';

        $this->assertArraySubset($apiJson->alerts, [$alert]);
    }
}

