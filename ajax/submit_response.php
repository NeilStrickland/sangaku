<?php

$allow_bot = 1;

require_once('../include/sangaku.inc');

$instance = $sangaku->get_object_parameter('instance','poll_instance');
$student  = $sangaku->get_object_parameter('student','user');

if (! ($instance && $student)) {
 echo "0";
 exit;
}

$poll = $instance->load_link('poll');
$poll->load_items();

$response_text = get_optional_parameter('response','');

$w = <<<SQL
 x.instance_id={$instance->id} AND
 x.user_id={$student->id}

SQL;

$xx = $sangaku->load_where('poll_responses',$w);

if ($xx) {
 $n = count($xx);
 $x = $xx[$n-1];
 for ($i = 0; $i < $n-1; $i++) { $xx[$i]->delete(); }
} else {
 $x = $sangaku->new_object('poll_response');
 $x->instance_id = $instance->id;
 $x->user_id = $student->id;
}

echo "Setting response text={$response_text}<br/>";
$x->set_response_text($response_text);
echo "Response text={$x->response_text}<br/>";

$x->response_timestamp = time();
$x->save();
