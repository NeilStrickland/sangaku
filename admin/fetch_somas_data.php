<?php

require_once('../include/sangaku.inc');
require_once('../include/somas_agent.inc');

$di = $sangaku->get_date_info();
$session = (int) $di->session;
$semester = $di->semester;

$a = new somas_agent();
$a->connect();

$a->fetch_engl1_modules($session);
$module_changes = $a->fetch_modules($session);
echo "Changed modules:<br/>";
foreach($module_changes as $m) {
 echo "{$m->code}<br/>" . PHP_EOL;
}

echo "<br/><br/>" . PHP_EOL;

$group_changes = $a->fetch_groups($session,$semester);
echo "Changed groups:<br/>";
foreach($group_changes as $g) {
 $g->load();
 echo "{$g->module_code} ({$g->name})<br/>" . PHP_EOL;
}

echo "<br/><br/>" . PHP_EOL;

$student_changes = $a->fetch_students();
echo "Changed students:<br/>";
foreach($student_changes as $s) {
 $s->load();
 echo "{$s->surname},{$s->forename},{$s->username}<br/>" . PHP_EOL;
}

echo "<br/><br/>" . PHP_EOL;

$registration_changes = $a->fetch_registrations();
echo "Changed registrations:<br/>";
foreach($registration_changes as $r) {
 echo "{$r->surname},{$r->forename},{$r->module_code},{$r->action}<br/>" . PHP_EOL;
}

echo "<br/><br/>" . PHP_EOL;

$group_student_changes = $a->fetch_group_students();
echo "Changed students in tutorial groups:<br/>";
foreach($group_student_changes as $l) {
 if ($l->action == 'missing_student') {
  echo <<<HTML
{$l->membership_id},{$l->somas_student_id},{$l->somas_event_id},
{$l->module_code},{$l->tutorial_group_name},{$l->action}
<br/>

HTML;
 } else {
 echo <<<HTML
{$l->surname},{$l->forename},
{$l->module_code},{$l->tutorial_group_name},{$l->action}
<br/>

HTML;
 }
}

$a->fetch_teachers();
