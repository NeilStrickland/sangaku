<?php

$allow_bot = 1;

require_once('../include/sangaku.inc');

$session = $sangaku->get_object_parameter('session');

if (! $session) {
 echo "0";
 exit;
}

$session->load_snapshots();

$ss = array();
foreach($session->snapshots as $s) {
 $ss[] = $s->for_json();
}

echo json_encode($ss);


