<?php

require_once('../include/sangaku.inc');

$debug = true;

$params = $sangaku->get_session_student_params();

if (! ($params->is_valid && $params->item)) {
 if ($debug) {
  pre_print($params);
 }

 exit;
}

$status_id = (int) get_optional_parameter('status_id',0);

$r = $sangaku->new_object('status_report');

$r->session_id = $params->session_id;
$r->item_id    = $params->item_id;
$r->student_id = $params->student_id;
$r->status_id  = $status_id;
$r->save();

echo $r->id;
