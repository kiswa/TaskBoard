<?php
class DbLogger {
    public static function logChange($container, $user_id, $log_text, $before,
            $after, $item_type, $item_id) {
        $activity = new Activity($container);

        $activity->user_id = $user_id;
        $activity->log_text = $log_text;
        $activity->before = $before;
        $activity->after = $after;
        $activity->item_type = $item_type;
        $activity->item_id = $item_id;
        $activity->timestamp = time();

        $activity->save();
    }
}

