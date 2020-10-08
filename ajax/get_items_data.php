<?php

require_once('../include/sangaku.inc');

if ($user->status != 'teacher') { exit; }

$sheet = $sangaku->get_object_parameter('problem_sheet');

if (! $sheet) { echo "0"; exit; }

$sheet->load_question_items();

$items = array();
foreach($sheet->question_items as $item) {
 $items[] = $item->for_json();
}

echo json_encode($items);
