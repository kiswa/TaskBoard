<?php
require_once __DIR__ . '/../Mocks.php';

class ActivityTest extends PHPUnit_Framework_TestCase {
    private $json = '';
    private $bean;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    protected function setUp() {
        RedBeanPHP\R::nuke();

        if ($this->json !== '') {
            return;
        }

        $activity = DataMock::getActivity();
        $this->json = json_encode($activity);
        $this->bean = $activity;
    }

    public function testCreateActivity() {
        $activity = new Activity(new ContainerMock());
        $this->assertDefaultProperties($activity);
    }

    public function testCreateFromBean() {
        $activity = Activity::fromBean(new ContainerMock(), null);
        $this->assertDefaultProperties($activity);

        $activity = Activity::fromBean(new ContainerMock(), $this->bean);
        $this->assertMockProperties($activity);
    }

    public function testLoadFromJson() {
        $activity = new Activity(new ContainerMock());

        $activity->loadFromJson('');
        $this->assertDefaultProperties($activity);

        $activity->loadFromJson($this->json);
        $this->assertMockProperties($activity);
    }

    private function assertMockProperties($activity) {
        $this->assertTrue($activity->id === 1);
        $this->assertTrue($activity->user_id === 1);
        $this->assertTrue($activity->log_text === 'Log test.');
        $this->assertTrue($activity->before === null);
        $this->assertTrue($activity->after === null);
        $this->assertTrue($activity->item_type === 'test');
        $this->assertTrue($activity->item_id === 1);
    }

    private function assertDefaultProperties($activity) {
        $this->assertTrue($activity->id === 0);
        $this->assertTrue($activity->user_id === 0);
        $this->assertTrue($activity->log_text === '');
        $this->assertTrue($activity->before === null);
        $this->assertTrue($activity->after === null);
        $this->assertTrue($activity->item_type === '');
        $this->assertTrue($activity->item_id === 0);
    }
}

