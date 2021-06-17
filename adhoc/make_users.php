<?php

require_once('../include/sangaku.inc');
$students = array();

foreach($students as $s0) {
 $ss = $sangaku->load_where('user',"x.username={$s0[2]}");
 if (! $ss) {
  $s = $sangaku->new_object('user');
  $s->surname  = $s0[0];
  $s->forename = $s0[1];
  $s->username = $s0[2];
  $s->save();

  $m = $sangaku->new_object('tutorial_group_student');
 }
}
