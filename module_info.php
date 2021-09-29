<?php

ini_set('display_errors',1);

require_once('include/sangaku.inc');

class module_editor extends frog_object_editor {
 function __construct() { 
  global $sangaku;
  parent::__construct($sangaku,'module');
  
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
  return '/sangaku/module_list.php';
 }
 
 function associated_lists() {
  return(
   array(
    array('name' => 'tutorial_group'),
    array('name' => 'problem_sheet'),
    array('name' => 'poll'),
    array('name' => 'registration')
   )
  );
 }

 function edit_page_widgets() {
  return array('mathjax','tabber','autosuggest','calendar');
 }

 function edit_page() {
  global $sangaku;

  $N = $sangaku->nav;
  $H = $sangaku->html;
  $m = $this->object;
  $m->load_sessions();

  echo $this->edit_page_header();
 
  echo $N->top_menu();
  
  echo <<< HTML
 <div class="tabber" id="module_info_tabber_{$m->id}">
 
HTML;

  $this->general_tab();
  $this->groups_tab();
  $this->sheets_tab();
  $this->polls_tab();
  $this->sessions_tab();
  $this->students_tab();
  
  echo <<< HTML
 </div>
 
HTML;
  echo $this->edit_page_footer();
 }
 
 function general_tab() {
  global $sangaku,$user;
  
  $H = $sangaku->html;
  $N = $sangaku->nav;
  $m = $this->object;
  $sz = array('size' => 70);

  echo $H->tab_start('General');
  echo $H->edged_table_start();
  echo $H->spacer_row(150,300);

  echo $H->row($H->bold('Code:'),$H->text_input('code',$m->code));
  echo $H->row($H->bold('Title:'),$H->text_input('title',$m->title,$sz));
  echo $H->row($H->bold('Regular:'),$H->checkbox('is_regular',$m->is_regular));
  echo <<<HTML
 <tr>
  <td colspan="2">
   You should tick the box above if teaching for this module happens regularly, 
   at fixed times every week or alternate weeks for a full semester.
   If this module has a different kind of schedule, then you should
   leave the box unticked and also leave the semester empty.
   <br/>
  </td>
 </tr>
 
HTML;

  echo $H->row($H->bold('Semester:'),$H->semester_selector('semester',$m->semester));

  echo <<<HTML
 <tr>
  <td colspan="2">
   Sangaku is designed to be used alongside a video meeting system such as 
   Zoom, Google Meet or Blackboard Collaborate.  In the first box below you can
   enter a URL for such a system.  If there are individual URLs for each session,
   and no useful URL for the module as a whole, then you can leave this box blank.
   <br/><br/>
   In the second box you should enter a phrase like "Zoom meeting" or 
   "Blackboard page" which will be used to describe the links to users.
  </td>
 </tr>
 
HTML;

  echo $H->row($H->bold('Video URL:'),$H->text_input('video_url',$m->video_url,$sz));
  echo $H->row($H->bold('Description:'),$H->text_input('video_url_description',$m->video_url_description,$sz));
  echo $H->edged_table_end();

  echo $H->tab_end();

 }

 function groups_tab() {
  global $sangaku;
 
  $N = $sangaku->nav;
  $H = $sangaku->html;
  $m = $this->object;
 
  echo $H->tab_start('Tutorial groups');
  echo $H->edged_table_start();
  echo $H->spacer_row(60,90,60,60,60,300,60);
  echo $H->row('Group','Semester','Day','Time','Weeks','Teachers','');
  foreach($m->tutorial_groups as $g) {
   $g->load_teachers();
   $uu = array();

   foreach($g->teachers as $u) { 
    $n = $u->full_name;
    $uu[] = $n; 
   }

   $uu = implode(', ',$uu);
   $url = 'group_info.php?id=' . $g->id;
   
   echo $H->tr($H->td($g->name) .
               $H->td($g->semester) .
               $H->td($g->day_name()) .
               $H->td('' . $g->hour . ':00') . 
               $H->td($g->week_parity_long()) .
               $H->td($uu) .
               $H->link_td("Edit",$url));
  }
  
  echo $H->edged_table_end();

  $url0 = "group_info.php?module_id={$m->id}&command=new";
  $url1 = "assign_groups.php?module_id={$m->id}";
  
  echo "<br/>" . 
   $H->button_link('Create new tutorial group',$url0) .
   $H->button_link('Assign students to groups',$url1);

  echo $H->tab_end();
 }
 
 function sheets_tab() {
  global $sangaku;
 
  $N = $sangaku->nav;
  $H = $sangaku->html;
  $m = $this->object;
 
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
  
  echo "<br/>" . $H->button_link('Create new problem sheet',$url);

  echo $H->tab_end();
 }
 
 function polls_tab() {
  global $sangaku;
 
  $N = $sangaku->nav;
  $H = $sangaku->html;
  $m = $this->object;
 
  echo $H->tab_start('Polls');
  echo $H->edged_table_start();
  echo $H->spacer_row(60,120,120,300,60,60);
 
  echo $H->row('ID','Problem sheet','Code','Title','','');
  foreach ($m->polls as $p) {
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
 
  $url = "poll_info.php?module_id={$m->id}&command=new";
  
  echo "<br/>" . $H->button_link('Create new poll',$url);

  echo $H->tab_end();
 }
 
 function sessions_tab() {
  if ($this->object->is_regular) {
   $this->regular_sessions_tab();
  } else {
   $this->irregular_sessions_tab();
  }
 }

 function regular_sessions_tab() {
  global $sangaku;
 
  $N = $sangaku->nav;
  $H = $sangaku->html;
  $m = $this->object;
 
  echo $H->tab_start('Sessions');
 
  for ($i = 1; $i <= 2; $i++) {
   if ($m->sessions_by_semester[$i]) {
    echo <<< HTML
 <h3>Semester $i</h3><br/>
 
HTML;
    echo $H->edged_table_start();
    echo $H->spacer_row(60,300,150,60,30);
     
    for ($j = 0; $j <= 12; $j++) {
     if ($m->sessions_by_week[$i][$j]) {
      echo <<< HTML
  <tr>
   <td colspan="5" style="font-weight:bold; text-align:center; background: #888888;">Week $j</td>
  </tr>
 
HTML;
      foreach($m->sessions_by_week[$i][$j] as $s) {
       $url = 'session_monitor.php?session_id=' . $s->id;
       echo $H->tr($H->td($s->tutorial_group_name) . 
                   $H->td($s->problem_sheet_title) .
                   $H->td($s->friendly_start_time()) .
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
 
 function irregular_sessions_tab() {
  global $sangaku;
 
  $N = $sangaku->nav;
  $H = $sangaku->html;
  $m = $this->object;
 
  echo $H->tab_start('Sessions');
 
  echo $H->edged_table_start();
  echo $H->spacer_row(40,300,150,60,30);
  echo $H->row('Group','Problem sheet','Time','','Confirmed');

  foreach($m->sessions as $s) {
   $url = 'session_monitor.php?session_id=' . $s->id;
   echo $H->tr($H->td($s->tutorial_group_name) . 
   $H->td($s->problem_sheet_title) .
   $H->td($s->friendly_start_time()) .
   $H->link_td("Monitor",$url) . 
   $H->td($H->checkbox(
    'session_confirmed_' . $s->id,$s->is_confirmed,
    array(
     'id' => 'session_confirmed_' . $s->id,
     'onclick' => "sangaku.toggle_session_confirmed({$s->id})")))
   );
  }
 
  echo $H->edged_table_end();
  echo $H->tab_end();

 }
 
 function students_tab() {
  global $sangaku;
 
  $N = $sangaku->nav;
  $H = $sangaku->html;
  $m = $this->object;
 
  $n = count($m->registrations);
  
  echo $H->tab_start('Students');

  $url = "assign_groups.php?module_id={$m->id}";
  $b = $H->button_link('Assign students to tutorial groups',$url);

  echo <<< HTML
 <br/>
 There are $n registered students.
 <br/>
 $b
 <br/>
 
HTML;
  
  $m->extend_list('registrations',2);
  
  echo $H->edged_table_start();
  
  foreach($m->registrations as $s) {
   $p = $s->set_prefix();
   
   $u = 'user_info.php?id=' . $s->id;

   $h = $H->td($H->user_selector($p . '_student_id',$s->student_id));
   $h = $s->new_object_marker . "<table class=\"plain\"><tr>" . $h . "</table>";
   $h = $s->wrap_remover($h);
   echo $h;
  }
  
  echo $H->edged_table_end();
  echo $H->tab_end();
 }
}

(new module_editor())->run();
