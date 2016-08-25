<?php
require_once __DIR__ . '/../Mocks.php';

class IssueTrackerTest extends PHPUnit_Framework_TestCase {
    private $json = '';
    private $bean;

    public static function setupBeforeClass() {
        try {
            RedBeanPHP\R::setup('sqlite:tests.db');
        } catch (Exception $ex) { }
    }

    protected function setUp() {
        RedbeanPHP\R::nuke();

        if ($this->json !== '') {
            return;
        }

        $tracker = DataMock::getIssueTracker();
        $this->json = json_encode($tracker);
        $this->bean = $tracker;
    }

    public function testCreateIssueTracker() {
        $tracker = new IssueTracker(new ContainerMock());
        $this->assertDefaultProperties($tracker);
    }

    public function testSaveIssueTracker() {
        $tracker = new IssueTracker(new ContainerMock());
        $this->assertTrue($tracker->save());
    }

    public function testLoadFromBean() {
        $tracker = new IssueTracker(new ContainerMock());

        $tracker->loadFromBean(null);
        $this->assertDefaultProperties($tracker);

        $tracker->loadFromBean($this->bean);
        $this->assertMockProperties($tracker);
    }

    public function testLoadFromJson() {
        $tracker = new IssueTracker(new ContainerMock());

        $tracker->loadFromJson('');
        $this->assertDefaultProperties($tracker);

        $tracker->loadFromJson('{"id":0}');
        $this->assertDefaultProperties($tracker);

        $tracker->loadFromJson($this->json);
        $this->assertMockProperties($tracker);
    }

    private function assertDefaultProperties($tracker) {
        $this->assertEquals(0, $tracker->id);
        $this->assertEquals('', $tracker->url);
        $this->assertEquals('', $tracker->regex);
        $this->assertEquals(0, $tracker->board_id);
    }

    private function assertMockProperties($tracker) {
        $this->assertEquals(1, $tracker->id);
        $this->assertEquals('testUrl', $tracker->url);
        $this->assertEquals('testRegex', $tracker->regex);
        $this->assertEquals(1, $tracker->board_id);
    }
}

