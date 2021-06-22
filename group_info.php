<?php

ini_set('display_errors',1);

require_once('include/sangaku.inc');

class tutorial_group_editor extends frog_object_editor {
 function __construct() {
  global $sangaku;
  parent::__construct($sangaku,'tutorial_group');

  $this->commands = 
   array(
    'load' => true,
    'suggest_delete' => true,
    'delete' => true,
    'save' => true,
    'new' => true
   );
 }

 function check_authorisation() {
  global $user;
  return ($user->status == 'teacher');
 }

 function listing_url() {
  if ($this->object->module_id) {
   return '/sangaku/module_info.php?id=' . $this->object->module_id;
  } else {
   return null;
  }
 }
 
 function associated_lists() {
  return(
   array(
    array('name' => 'tutorial_group_student','link' => 'tutorial_group_id'),
    array('name' => 'tutorial_group_teacher','link' => 'tutorial_group_id')
   )
  );
 }

 function edit_page_widgets() {
  return array('mathjax','tabber','autosuggest');
 }
 
 function edit_page() {
  global $sangaku;

  $N = $sangaku->nav;
  $H = $sangaku->html;
  $g = $this->object;
  $m = $g->load_link('module');
  $g->load_associated();
  
  $this->edit_page_header();
  echo $N->top_menu();
 
  echo <<<HTML
<br/>
<div class="tabber">

HTML;

  $this->general_tab();
  $this->sessions_tab();
  $this->students_tab();
 
  echo <<<HTML
</div>

HTML
  ;
  
  $this->edit_page_footer();
 }

 function general_tab() {
  global $sangaku,$user;
  
  $H = $sangaku->html;
  $N = $sangaku->nav;
  $g = $this->object;

  echo $H->tab_start('General');
  echo $H->edged_table_start();
  echo $H->spacer_row(150,300);

  echo $H->row($H->bold('Module:'),$H->module_selector('module_id',$g->module_id));
  echo $H->row($H->bold('Group name:'),$H->text_input('name',$g->name,array('size' => 10)));
  echo $H->row($H->bold('Regular:'),$H->checkbox('is_regular',$g->is_regular));
  echo <<<HTML
 <tr>
  <td colspan="2">
   You should tick the box above if this group meets regularly, at
   a fixed time every week or alternate weeks for a full semester.
   If this group has a different kind of schedule, then you should
   leave the box unticked and also leave the boxes below empty.
   <br/>
  </td>
 </tr>
 
HTML;
  echo $H->row($H->bold('Semester:'),$H->semester_selector('semester',$g->semester));
  echo $H->row($H->bold('Day:'),$H->day_selector('day_number',$g->day_number));
  echo $H->row($H->bold('Weeks:'),$H->week_parity_selector('week_parity',$g->week_parity));

  echo <<<HTML
 <tr>
  <td colspan="2">
   If this group meets in alternate weeks, then you should choose
   the appropriate option in the box above.  Otherwise, you should
   leave the box blank.
   <br/>
  </td>
 </tr>
 
HTML;

  echo $H->edged_table_end();

  $this->teachers_block();
  
  echo $H->tab_end();
 }

 function teachers_block() {
  global $sangaku,$user;
  
  $H = $sangaku->html;
  $N = $sangaku->nav;
  $g = $this->object;

  $g->extend_list('tutorial_group_teachers',2,'teacher_links');
  
  echo <<<HTML
<br/>
<span style="font-weight:bold; font-size:16px;">Teachers</span>
<br/>

HTML;

  $oo = array('size' => 50, 'extra' => array('status' => 'teacher'));

  echo $H->edged_table_start();
  
  foreach($g->teacher_links as $t) {
   $p = $t->set_prefix();
   $k = $p . '_teacher_id';
   $h = $H->user_selector($k,$t->teacher_id,$oo);
   $h = "<div>" . $t->new_object_marker . $h . "</div>";
   $h = $t->wrap_remover($h);
   echo $h;
  }

  echo $H->edged_table_end();
 }
 
 function sessions_tab() {
  global $sangaku;

  $g = $this->object;
  $m = $g->load_link('module');
  
  $H = $sangaku->html;

  $g->extend_list('sessions');
  
  echo $H->tab_start('Sessions');

  echo $H->edged_table_start();
   
  foreach($g->sessions as $s) {
   $p = $s->set_prefix();
   $url = 'session_monitor.php?session_id=' . $s->id;
   $h = "<table class=\"plain\"><tr>" .
	$H->td($H->date_box($p . '_date',$s->date)) .
	$H->td($H->time_box($p . '_time',$s->time)) .
	$H->td($H->text_input($p . '_duration',$s->duration,array('size' => 2))) .
	$H->td($H->problem_sheet_selector($p . '_problem_sheet_id',
					  $s->problem_sheet_id,
					  array('size' => 20)) .
	       $s->new_object_marker) .
	$H->link_td("Monitor",$url) .
	"</tr></table>";
   $h = $s->wrap_remover($h);
   echo $h;
   
  }
     
  echo $H->edged_table_end();

  echo $H->tab_end();
 }

 function students_tab() {
  global $sangaku;

  $N = $sangaku->nav;
  $H = $sangaku->html;
  $g = $this->object;
  $m = $g->module;

  echo $H->tab_start('Students');
  echo $H->edged_table_start();
  echo $H->spacer_row(70,200,200,70);
 
  foreach ($g->students as $s) {
   echo $H->tr($H->td($s->username) .
               $H->td($s->forename) .
               $H->td($s->surname) .
               $H->link_td('Details',"user_info.php?id={$s->id}")) ;
  }
 
  echo $H->edged_table_end();
  echo $H->tab_end();
 }
}

(new tutorial_group_editor())->run();

