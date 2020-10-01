<?php

require_once('../include/sangaku.inc');

$session = $sangaku->get_object_parameter('session');

if (! $session) {
 echo "0";
 exit;
}

$session->load_associated();

foreach($session->tutorial_group->students as $s) {
 $s->load_status($session);
}

echo $session->to_json();

