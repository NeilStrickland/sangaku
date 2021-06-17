<?php

require_once('include/sangaku.inc');

$uid = (int) get_optional_parameter('uid',0);

if ($uid) { $user = $sangaku->load('user',$uid); }

$t = get_optional_parameter('t','');
if ($t) { $sangaku->fake_time = strtotime($t); }

if ($user->status == 'teacher') {
 teacher_index_page();
} else {
 student_index_page();
}

exit;

function teacher_index_page() {
 global $sangaku,$user;
 
 $N = $sangaku->nav;
 $H = $sangaku->html;

 $d = $sangaku->get_date_info();
 $semester = get_restricted_parameter('semester',array('','1','2'),$d->semester);

 $force_index = get_optional_parameter('force_index',0) ? 1 : 0;

 $user->load_teacher_sessions($semester);

 if (count($user->current_teacher_sessions) == 1 &&
     ! $force_index) {
  $url = $user->current_teacher_sessions[0]->teacher_url();
  header('Location: ' . $url);
  exit;
 }

 echo $N->header('Sangaku sessions');
 echo $N->top_menu();
 
 echo <<<HTML
<h1>Sangaku sessions</h1>

HTML
  ;
 
 if ($user->teacher_tutorial_groups) {
  echo <<<HTML
You are registered as a teacher for the following sessions:
<br/><br/>
<table class="edged">
 <tr>
  <td>Module</td>
  <td>Group</td>
  <td>Problem sheet</td>
  <td>Time</td>
  <td>Confirm</td>
 </tr>

HTML
   ;
  echo $H->spacer_row(80,80,300,140,80);
  
  foreach($user->teacher_tutorial_groups as $g) {
   if ($g->sessions_by_state['unfinished']) {
    foreach ($g->sessions_by_state['unfinished'] as $s) {
    if ($s->is_current()) {
     $t = ($sangaku->time() < $s->start_timestamp()) ? 'On soon' : 'On now';
     $url = $s->teacher_url();
     $x = <<<HTML
  <td style="width:140px" class="command" onclick="location='{$url}'">$t</td>

HTML
       ;
    } else {
     $t = date('D j/n H:i',$s->start_timestamp());
     $x = <<<HTML
  <td style="width:140px">$t</td>

HTML
        ;
     $url = $s->teacher_url();
     $x = <<<HTML
  <td style="width:140px" class="command" onclick="location='{$url}'">$t</td>

HTML
;
    }

    $edit_sheet_url = "problem_sheet_info.php?id={$s->problem_sheet_id}";

    $y = $H->td($H->checkbox('session_confirmed_' . $s->id,$s->is_confirmed,
                             array(
                              'id' => 'session_confirmed_' . $s->id,
                              'onclick' => "sangaku.toggle_session_confirmed({$s->id})")));
   
    echo <<<HTML
 <tr>
  <td class="module_code">{$s->module_code}</td>
  <td class="group_name">{$s->tutorial_group_name} [{$s->tutorial_group_id}]</td>
  <td class="command" class="sheet_name" onclick="location='{$edit_sheet_url}'">{$s->problem_sheet_title}</td>
$x
$y
 </tr>

HTML
     ;
    }
   } else {
    echo <<<HTML
 <tr>
  <td class="module_code">{$g->module_code}</td>
  <td class="group_name">{$g->name} [{$g->id}]</td>
  <td colspan="3">No upcoming sessions</td>
 </tr>

HTML
     ;

   }
  }

  echo <<<HTML
</table>
<br/><br/>

HTML
  ;
 }

 echo $sangaku->nav->footer();

}

function student_index_page() {
 global $sangaku, $user;

 $N = $sangaku->nav;
 $H = $sangaku->html;
 
 $force_index = get_optional_parameter('force_index',0) ? 1 : 0;

 list($sem,$w) = $sangaku->week_number();
 
 $user->load_student_sessions($sem);

 $N->header('Sangaku');

 echo <<<HTML
<h1>Sangaku sessions for Week $w</h1>
<br/>

HTML
  ;

 echo $H->edged_table_start();
 
 foreach($user->registrations as $r) {
  echo <<<HTML
 <tr class="module_header">
  <td>{$r->module_code} ({$r->module_title})</td>
 </tr>

HTML
;
  if (! $r->sheets) {
   echo <<<HTML
 <tr>
  <td>There are no problem sheets this week.</td>
 </tr>

HTML
    ;
  } else { // some sheets
   foreach($r->sheets as $p) {
    $c = $p->code;
    if ($p->title && $p->title != $c) { $c .= " ({$p->title})"; }
    echo <<<HTML
 <tr class="problem_sheet_header">
  <td>{$c}</td>
 </tr>

HTML
     ;

    $p->alternatives = array_merge(
     $p->unapproved_sessions_by_state['imminent'],
     $p->unapproved_sessions_by_state['running'],
     $p->unapproved_sessions_by_state['future']
    );
    
    if ($p->approved_session) {
     $s0 = $p->approved_session;
     if ($s0->time_state == 'future') {
      $msg = <<<HTML
You are registered for group {$s0->tutorial_group_name}, which is at {$s0->friendly_start_time()}.  
 
HTML
           ;
      if ($p->alternatives) {
       $msg .= <<<HTML
You should attend this session if possible.  However, there are various alternative sessions
that you could attend if necessary.

HTML
            ;
      } else {
       $msg .= <<<HTML
You should attend this session if possible.  There are no other alternative sessions available.

HTML
            ;
      }
     } else if ($s0->time_state == 'imminent' || $s0->time_state == 'running') {
      $msg = <<<HTML
You are registered for group {$s0->tutorial_group_name}, which is happening now, or starting 
very soon.  
 
HTML
 ;
      if ($p->alternatives) {
       $msg .= <<<HTML
You should attend this session if possible.  However, there are various alternative sessions
that you could attend if necessary.

HTML
            ;
      } else { // no alternatives
       $msg .= <<<HTML
You should attend this session if possible.  There are no other alternative sessions available.

HTML
            ;
      } // end if($p->alternatives) ... else
     } else if ($s0->time_state == 'finished') {
       $msg = <<<HTML
You were registered for group {$s0->tutorial_group_name}, which has now finished.
 
HTML
 ;
       if ($p->alternatives) {
        $msg .= <<<HTML
If you missed that session, there are various alternative sessions that you could
attend instead.

HTML
             ;
       } else { // no alternatives
        $msg .= <<<HTML
There are no other upcoming Sangaku sessions for this problem sheet.

HTML
             ;
       } // end if($p->alternatives) ... else
     } // end split over time state of approved session
    } else { // no approved session
     if ($p->group) {
      if ($p->alternatives) {
       $msg = <<<HTML
You are registered for group {$p->group->name}, but no Sangaku session has been scheduled for
this group.  Nonetheless, there may be a Blackboard Collaborate session without Sangaku for group 
{$p->group->name} that you should attend.  However, there are various alternative Sangaku
sessions that you could attend if necessary.

HTML
           ;
      } else { // no alternatives
       $msg = <<<HTML
You are registered for group {$p->group->name}, but no Sangaku session has been scheduled for
this group, and no other group has upcoming Sangaku sessions for this problem sheet either.
Nonetheless, there may be a Blackboard Collaborate session without Sangaku for group 
{$p->group->name} that you should attend.  

HTML
           ;
      } // end if($p->alternatives) ... else
     } else { // user has no group for this problem sheet
      if ($p->alternatives) {
       $msg = <<<HTML
It seems that you have not been allocated to a tutorial group for this problem sheet.
There are various upcoming Sangaku sessions, and you could attend one of them anyway.

HTML
            ;
      } else { // no alternatives
       $msg = <<<HTML
It seems that you have not been allocated to a tutorial group for this problem sheet.
Moreover, there are no upcoming Sangaku sessions for any group.  Nonetheless, there 
may be Blackboard Collaborate sessions without Sangaku that you could attend.  You
should consult with the lecturer.

HTML
            ;
      } // end if($p->alternatives) ... else
     } // end if($p->group) ... else
    } // end if($p->approved_session) ... else

    $buttons = '';
    if ($p->approved_session) {
     $buttons .= '<br/>' . $p->approved_session->student_button($user->id,true);
    }
    
    if ($p->alternatives) {
     $buttons .= '<br/>'; 
     foreach($p->alternatives as $a) {
      $buttons .= $a->student_button($user->id,false);
     }
    }

    echo <<<HTML
  <tr>
   <td>
    {$msg}
    {$buttons}
   </td>
  </tr>

HTML
     ;
    
   } // end loop over sheets
  } // end if (! $r->sheets) ... else 
 }

 echo $H->edged_table_end();

 if (! $user->registrations) {
  echo <<<HTML
You are not registered for any modules.

HTML
   ;
 }
 
 $N->footer();
}



