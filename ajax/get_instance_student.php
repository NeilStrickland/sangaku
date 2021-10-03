<?php

require_once('../include/sangaku.inc');

$instance = $sangaku->get_object_parameter('instance','poll_instance');
$student  = $sangaku->get_object_parameter('student','user');

if (! ($instance && $student)) {
 echo "0";
 exit;
}

$poll = $instance->load_link('poll');
$poll->load_items();

if ($instance->state == 'count' || $instance->state == 'correct') {
 $instance->count_responses();
}

$x = $instance->for_json();

$x->student = $student->for_json();

echo json_encode($x);

