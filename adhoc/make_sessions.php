<?php

require_once('../include/sangaku.inc');


$slots = array(
 array('MAS140A',3,9,5,9),
 array('MAS140B',3,9,5,9),
 array('MAS151A',3,9,5,9),
 array('MAS151B',3,9,5,9),
 array('MAS151C',3,9,5,9),
 array('MAS152A',1,9,4,9),
 array('MAS152B',1,9,4,9),
 array('MAS152C',1,9,4,9),
 array('MAS152D',1,9,4,9),
 array('MAS153A',2,9,4,9),
 array('MAS156A',1,9,4,9),
 array('MAS156B',1,9,4,9),
 array('MAS156C',1,9,4,9),
 array('MAS156D',1,9,4,9),
 array('MAS156E',1,9,4,9),
 array('MAS161A',2,11,3,9)
);

$groups_by_name = make_index($sangaku->load_all('tutorial_groups'),'name');

$t0 = strtotime('2020-09-20 12:00');

foreach($slots as $s) {
 $g = $groups_by_name[$s[0]];

 $k = 1;
 for($i = 1; $i <= 12; $i++) {
  if ($i == 7) { continue; }

  $t1 = $t0 + (7 * $i + $s[1]) * 24 * 3600;
  if ($s[2] < 10) {
   $h = '0' . $s[2];
  } else {
   $h = '' . $s[2];
  }
  $d1 = date('Y-m-d',$t1) . ' ' . $h . ':00:00';
  $t2 = strtotime($d1);
  $d2 = date('Y-m-d H:i:s',$t2);
  $x = $sangaku->new_object('session');
  $x->problem_sheet_id = $k;
  $x->tutorial_group_id = $g->id;
  $x->start_time = $d1;
  $x->duration = 50;
  $x->save();
  $k++;

  $t1 = $t0 + (7 * $i + $s[3]) * 24 * 3600;
  if ($s[4] < 10) {
   $h = '0' . $s[4];
  } else {
   $h = '' . $s[4];
  }
  $d1 = date('Y-m-d',$t1) . ' ' . $h . ':00:00';
  $t2 = strtotime($d1);
  $d2 = date('Y-m-d H:i:s',$t2);
  $x = $sangaku->new_object('session');
  $x->problem_sheet_id = $k;
  $x->tutorial_group_id = $g->id;
  $x->start_time = $d1;
  $x->duration = 50;
  $x->save();
  $k++;
 }
}

