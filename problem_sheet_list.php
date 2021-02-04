<?php

require_once('include/sangaku.inc');

$module = $sangaku->get_object_parameter('module');

$d = $sangaku->get_date_info();
$semester = get_restricted_parameter('semester',array('','1','2'),$d->semester);

if (! $module) { error_page('Module not found'); exit; }

$module->load_problem_sheets();

$N = $sangaku->nav;
$H = $sangaku->html;
 
echo $N->header($module->code,array('widgets' => array('mathjax')));

echo $N->top_menu();

$ss = $H->semester_selector('semester',$semester,
                            array('onchange' => 'document.control_form.submit()'));

echo <<<HTML
<h1>Problem sheets for {$module->code} ({$module->title})</h1>
<br/>
<form name="control_form" action="problem_sheet_list.php">
<input type="hidden" name="module_id" value="{$module->id}"/>
Semester: $ss
</form>
<br/><br/>

HTML
  ;

    
echo $H->edged_table_start();
echo $H->spacer_row(60,60,500,60,60);

echo $H->row('Semester','Week','Title','','');
foreach ($module->problem_sheets as $s) {
 if ($semester && $s->semester && ($semester != $s->semester)) {
  continue;
 }
 
 echo $H->tr($H->td($s->semester) .
             $H->td($s->week_number).
             $H->td($s->title) .
             $H->link_td("Preview","problem_sheet_info.php?command=display&id={$s->id}") .
             $H->link_td("Edit","problem_sheet_info.php?id={$s->id}")
 );
}
 
echo $H->edged_table_end();

$N->footer();

