<?php

require_once('../include/sangaku.inc');

$gg = $sangaku->load_where('tutorial_group',"name='14'");

if (! $gg) { echo "Group not found"; exit; }

$group = $gg[0];

$students = array(
"pha20jh","pha20djb","pha19obb","phd18ac","pha20tc","pha20td","phb19wm","pha20sm","pha20jn","pha19sp","pha20clf","pha19bjg"
);

foreach($students as $s) {
 $r = $group->add_student_by_username($s);
 echo "{$r->username},{$r->forename} {$r->surname}<br/>" . PHP_EOL;
}


