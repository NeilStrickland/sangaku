<?php

require_once('include/sangaku.inc');

$module = $sangaku->get_object_parameter('module');

if (! $module) { error_page('Module not found'); exit; }

$module->load_polls();

$N = $sangaku->nav;
$H = $sangaku->html;
 
echo $N->header($module->code,array('widgets' => array('mathjax')));

echo $N->top_menu();

echo <<<HTML
<h1>Problem sheets for {$module->code} ({$module->title})</h1>
<br/>
<form name="control_form" action="poll_list.php">
<input type="hidden" name="module_id" value="{$module->id}"/>
</form>
<br/><br/>

HTML
  ;

    
echo $H->edged_table_start();
echo $H->spacer_row(60,120,120,300,60,60);
 
echo $H->row('ID','Problem sheet','Code','Title','','');
foreach ($module->polls as $p) {
 $sheet = $p->problem_sheet_code;
 if (! $sheet) { $sheet = $p->problem_sheet_title; }
 echo $H->tr($H->td($p->id) .
             $H->td($sheet) .
             $H->td($p->code).
             $H->td($p->title) .
             $H->link_td("Preview","poll_info.php?command=display&id={$p->id}") .
             $H->link_td("Edit","poll_info.php?id={$p->id}")
 );
}

echo $H->edged_table_end();

$url = "poll_info.php?module_id={$module->id}&command=new";
  
echo "<br/>" . $H->button_link('Create new poll',$url);


$N->footer();

