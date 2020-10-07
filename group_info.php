<?php

require_once('include/sangaku.inc');

$params = get_params();

info_page($params);
 
exit;

//////////////////////////////////////////////////////////////////////

function get_params() {
 global $sangaku;
 
 $params = new stdClass();

 $g = $sangaku->get_object_parameter('id','tutorial_group');
 $params->group = $g;
 
 if ($g) {
  $g->load_teachers();
  $g->load_students();
  $g->load_sessions();
 }

 $params->module = $g->load_link('module');
 
 $params->date_info =
  json_decode(file_get_contents('https://maths.shef.ac.uk/maths/date_info.php'));

 $tt = array();
 foreach($g->teachers as $t) {
  $tt[] = $t->full_name;
 }
 $tt = implode(', ',$tt);
 
 $params->teachers_string = $tt;
 
 return $params;
}

//////////////////////////////////////////////////////////////////////

function info_page($params) {
 global $sangaku;

 $N = $sangaku->nav;
 $H = $sangaku->html;
 $m = $params->module;
 $g = $params->group;
 
 echo $N->header($m->code . '(' . $g->name . ')',
                 array('widgets' => array('mathjax','tabber')));

 echo $N->top_menu();
 
 echo <<<HTML
<h1>{$m->code} {$m->title} Group {$g->name}</h1>
<br/>
<div class="tabber">

HTML;

 sessions_tab($params);
 students_tab($params);
 
 echo <<<HTML
</div>

HTML
  ;
 echo $N->footer();
}

function sessions_tab($params) {
 global $sangaku;

 $N = $sangaku->nav;
 $H = $sangaku->html;
 $g = $params->group;
 $m = $params->module;

 echo $H->tab_start('Sessions');

 echo <<<HTML
<h3>Teachers</h3>
<br/>
{$params->teachers_string}
<br/>

HTML
  ;

 for ($i = 1; $i <= 2; $i++) {
  if ($g->sessions_by_semester[$i]) {
   echo <<<HTML
<h3>Semester $i</h3><br/>

HTML;
   echo $H->edged_table_start();
   echo $H->spacer_row(60,300,120,60);
    
   for ($j = 0; $j <= 12; $j++) {
    if ($g->sessions_by_week[$i][$j]) {
     echo <<<HTML
 <tr>
  <td colspan="4" style="font-weight:bold; text-align:center; background: #888888;">Week $j</td>
 </tr>

HTML
      ;
     foreach($g->sessions_by_week[$i][$j] as $s) {
      $url = 'session_monitor.php?session_id=' . $s->id;
      echo $H->tr($H->td($s->tutorial_group_name) . 
                  $H->td($s->problem_sheet_title) .
                  $H->td(date('D j/n H:i',$s->start_timestamp)) .
                  $H->link_td("Monitor",$url));
     }
    }
   }

   echo $H->edged_table_end();
  }
 }
 
 echo $H->tab_end();
}

function students_tab($params) {
 global $sangaku;

 $N = $sangaku->nav;
 $H = $sangaku->html;
 $m = $params->module;

 echo $H->tab_start('Students');
 echo $H->edged_table_start();
 echo $H->spacer_row(70,200,200,70);
 
 foreach ($params->group->students as $s) {
  echo $H->tr($H->td($s->username) .
              $H->td($s->forename) .
              $H->td($s->surname) .
              $H->link_td('Details',"student_info.php?id={$s->id}")) ;
 }
 
 echo $H->edged_table_end();
 echo $H->tab_end();
}

