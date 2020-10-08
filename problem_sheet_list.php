<?php

require_once('include/sangaku.inc');

$module = $sangaku->get_object_parameter('module');

if (! $module) { error_page('Module not found'); exit; }

$module->load_problem_sheets();

$N = $sangaku->nav;
$H = $sangaku->html;
 
echo $N->header($module->code,array('widgets' => array('mathjax')));

echo $N->top_menu();

echo <<<HTML
<h1>Problem sheets for {$module->code} ({$module->title})</h1>
<br/>
HTML
  ;

echo $H->edged_table_start();
echo $H->spacer_row(60,60,500,60,60);

echo $H->row('Semester','Week','Title','','');
foreach ($module->problem_sheets as $s) {
 echo $H->tr($H->td($s->semester) .
             $H->td($s->week_number).
             $H->td($s->title) .
             $H->link_td("Preview","problem_sheet_info.php?command=display&id={$s->id}") .
             $H->link_td("Edit","problem_sheet_info.php?id={$s->id}")
 );
}
 
echo $H->edged_table_end();

$N->footer();

