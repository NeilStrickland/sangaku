<?php

require_once('../include/sangaku.inc');

$session = $sangaku->get_object_parameter('session');
$student = $sangaku->get_object_parameter('student','user');
$with_solutions = get_optional_parameter('with_solutions',0) ? 1 : 0;
if ($user->status != 'teacher') { $with_solutions = 0; }

if (! ($session && $student)) {
 echo "0";
 exit;
}

if ($session->problem_sheet_id && $session->is_online) {
 $session->load_link('problem_sheet');
 $session->problem_sheet->load_question_items();
}

if ($session->tutorial_group_id) {
 $session->load_link('tutorial_group');
}

$session->load_snapshots();
$session->load_poll_instances();

$student->load_status($session);

if ($user->status == 'teacher') {
 $x = $session->for_json($with_solutions);
 $x->student = $student->for_json();
 $x->teacher = $user->for_json();
} else {
 $x = $session->for_json();
 $x->student = $student->for_json();
}

echo json_encode($x);

