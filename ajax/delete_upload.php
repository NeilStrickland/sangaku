<?php

require_once('../include/sangaku.inc');

$id = (int) get_optional_parameter('id',0);
if (! $id) { exit; }
$upload = $sangaku->load('upload',$id);
if (! $upload) { exit; }

if ($user->status == 'teacher' || $upload->student_id = $user->id) {
 $upload->delete();
}
