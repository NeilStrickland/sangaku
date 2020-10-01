<?php

require_once('../include/sangaku.inc');

$T = array();

$reg = $sangaku->load_all('registrations');

foreach($reg as $r) {
 if (! isset($T[$r->student_id])) {
  $T[$r->student_id] = array();
 }

 if (isset($T[$r->student_id][$r->module_id])) {
  echo "Deleting duplicate {$r->id},{$r->student_id},{$r->module_id}<br/>" . PHP_EOL;
  $r->delete();
 } else {
  $T[$r->student_id][$r->module_id] = $r;
 }
}
