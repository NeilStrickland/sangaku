<?php

require_once('include/sangaku.inc');

$params = get_params();

info_page($params);
 
exit;

//////////////////////////////////////////////////////////////////////

function get_params() {
 global $sangaku;
 
 $params = new stdClass();

 $m = $sangaku->get_object_parameter('id','module');
 $params->module = $m;
 
 if ($m) {
  $m->load_tutorial_groups();
  $m->load_problem_sheets();
  $m->load_sessions();
  $m->load_students();
  
  foreach($m->tutorial_groups as $g) {
   $g->load_teachers();
   $g->load_students();
  }
 }

 $params->date_info = $sangaku->get_date_info();

 return $params;
}

//////////////////////////////////////////////////////////////////////

function info_page($params) {
 global $sangaku;

 $N = $sangaku->nav;
 $H = $sangaku->html;
 $m = $params->module;
 
 echo $N->header($m->code,array('widgets' => array('mathjax','tabber')));

 echo $N->top_menu();
 
 echo <<<HTML
<h1>{$m->code} {$m->title}</h1>
<br/>
<div class="tabber" id="module_info_tabber_{$m->id}">

HTML;

 groups_tab($params);
 sheets_tab($params);
 sessions_tab($params);
 students_tab($params);
 
 echo <<<HTML
</div>

HTML
  ;
 echo $N->footer();
}

function groups_tab($params) {
 global $sangaku;

 $N = $sangaku->nav;
 $H = $sangaku->html;
 $m = $params->module;

 echo $H->tab_start('Tutorial groups');
 echo $H->edged_table_start();
 echo $H->spacer_row(60,60,60,60,300,60);
 echo $H->row('Group','Day','Time','Weeks','Teachers','');
 foreach($m->tutorial_groups as $g) {
  $tt = array();
  foreach($g->teachers as $t) {
   $tt[] = $t->full_name;
  }
  $tt = implode(', ',$tt);
  $url = 'group_info.php?id=' . $g->id;
  
  echo $H->tr($H->td($g->name) .
              $H->td($g->day_name()) .
              $H->td('' . $g->hour . ':00') . 
              $H->td($g->week_parity_long()) .
              $H->td($tt) .
              $H->link_td("Details",$url));
 }
 
 echo $H->edged_table_end();
 echo $H->tab_end();
}

function sheets_tab($params) {
 global $sangaku;

 $N = $sangaku->nav;
 $H = $sangaku->html;
 $m = $params->module;

 echo $H->tab_start('Problem sheets');
 echo $H->edged_table_start();
 echo $H->spacer_row(60,60,500,60,60);

 echo $H->row('Semester','Week','Title','','');
 foreach ($m->problem_sheets as $s) {
  echo $H->tr($H->td($s->semester) .
              $H->td($s->week_number).
              $H->td($s->title) .
              $H->link_td("Preview","problem_sheet_info.php?command=display&id={$s->id}") .
              $H->link_td("Edit","problem_sheet_info.php?id={$s->id}")
  );
 }
 
 echo $H->edged_table_end();

 $url = "problem_sheet_info.php?module_id={$m->id}&command=new";
 
 echo <<<HTML
<br/><br/>
<button type="button" onclick="location='$url'">Create new problem sheet</button>

HTML
  ;
 echo $H->tab_end();
}

function sessions_tab($params) {
 global $sangaku;

 $N = $sangaku->nav;
 $H = $sangaku->html;
 $m = $params->module;

 echo $H->tab_start('Sessions');

 for ($i = 1; $i <= 2; $i++) {
  if ($m->sessions_by_semester[$i]) {
   echo <<<HTML
<h3>Semester $i</h3><br/>

HTML
;
   echo $H->edged_table_start();
   echo $H->spacer_row(60,300,120,60,30);
    
   for ($j = 0; $j <= 12; $j++) {
    if ($m->sessions_by_week[$i][$j]) {
     echo <<<HTML
 <tr>
  <td colspan="5" style="font-weight:bold; text-align:center; background: #888888;">Week $j</td>
 </tr>

HTML
      ;
     foreach($m->sessions_by_week[$i][$j] as $s) {
      $url = 'session_monitor.php?session_id=' . $s->id;
      echo $H->tr($H->td($s->tutorial_group_name) . 
                  $H->td($s->problem_sheet_title) .
                  $H->td(date('D j/n H:i',$s->start_timestamp)) .
                  $H->link_td("Monitor",$url) . 
                  $H->td($H->checkbox(
                   'session_confirmed_' . $s->id,$s->is_confirmed,
                   array(
                    'id' => 'session_confirmed_' . $s->id,
                    'onclick' => "sangaku.toggle_session_confirmed({$s->id})")))
      );
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

 $n = count($m->students);
 
 echo $H->tab_start('Students');

 echo <<<HTML
<br/>
There are $n registered students.
<br/>

HTML
  ;
 
 echo $H->edged_table_start();
 echo $H->spacer_row(60,300,60);
 
 foreach($m->students as $s) {
  echo $H->row($s->username,$s->full_name,$s->tutorial_group_name);
 }
 
 echo $H->edged_table_end();
 echo $H->tab_end();
}

