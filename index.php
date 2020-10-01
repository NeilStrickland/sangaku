<?php

require_once('include/sangaku.inc');

$user->load_sessions();
$user->load_teacher_sessions();
$force_index = get_optional_parameter('force_index',0) ? 1 : 0;

if (count($user->current_sessions) == 1 &&
    count($user->current_teacher_sessions) == 0 &&
    ! $force_index) {
 $url = $user->current_sessions[0]->url(); 
 header('Location: ' . $url);
 exit;
}

if (count($user->current_sessions) == 0 &&
    count($user->current_teacher_sessions) == 1 &&
    ! $force_index) {
 $url = $user->current_teacher_sessions[0]->teacher_url();
 header('Location: ' . $url);
 exit;
}

echo $sangaku->nav->header('Sessions');

echo <<<HTML
<h1>Sangaku sessions</h1>
<br/><br/>
HTML;

if ($user->future_sessions ||
    $user->unlimited_sessions) {
 echo <<<HTML
You are registered for the following sessions:
<br/>
<table class="edged">

HTML;

 foreach($user->future_sessions as $s) {
  if ($s->is_current()) {
   $t = (time() < $s->start_timestamp()) ? 'On soon' : 'On now';
   $url = $s->url();
   $x = <<<HTML
  <td style="width:140px" class="command" onclick="location='{$url}'">$t</td>

HTML;
  } else {
   $t = date('D j/n H:i',$s->start_timestamp());
   $x = <<<HTML
  <td style="width:140px">$t</td>

HTML;
  }
  
  echo <<<HTML
 <tr>
  <td style="width:60px">{$s->module_code}</td>
  <td style="width:60px">{$s->tutorial_group_name}</td>
  <td style="width:300px">{$s->problem_sheet_title}</td>
$x
 </tr>

HTML;
 }

 foreach($user->unlimited_sessions as $s) {
  echo <<<HTML
 <tr>
  <td>{$s->module_code}</td>
  <td>{$s->tutorial_group_name}</td>
  <td>{$s->problem_sheet_title}</td>
  <td style="width:100px">&nbsp;</td>
 </tr>

HTML;
 }

 echo <<<HTML
</table>
<br/><br/>

HTML;
}

if ($user->future_teacher_sessions ||
    $user->unlimited_teacher_sessions) {
 echo <<<HTML
You are registered as a teacher for the following sessions:
<br/>
<table class="edged">

HTML;

 foreach($user->future_teacher_sessions as $s) {
  if ($s->is_current()) {
   $t = (time() < $s->start_timestamp()) ? 'On soon' : 'On now';
   $url = $s->teacher_url();
   $x = <<<HTML
  <td style="width:140px" class="command" onclick="location='{$url}'">$t</td>

HTML;
  } else {
   $t = date('D j/n H:i',$s->start_timestamp());
   $x = <<<HTML
  <td style="width:140px">$t</td>

HTML;
  }
  
  echo <<<HTML
 <tr>
  <td style="width:60px">{$s->module_code}</td>
  <td style="width:60px">{$s->tutorial_group_name}</td>
  <td style="width:300px">{$s->problem_sheet_title}</td>
$x
 </tr>

HTML;
 }

 foreach($user->unlimited_teacher_sessions as $s) {
  echo <<<HTML
 <tr>
  <td>{$s->module_code}</td>
  <td>{$s->tutorial_group_name}</td>
  <td>{$s->problem_sheet_title}</td>
  <td style="width:100px">&nbsp;</td>
 </tr>

HTML;
 }

 echo <<<HTML
</table>
<br/><br/>

HTML;
}

if (! ($user->future_sessions ||
       $user->unlimited_sessions ||
       $user->future_teacher_sessions ||
       $user->unlimited_teacher_sessions)) {
 echo <<<HTML
You are not registered for any sessions.

HTML;
}


echo $sangaku->nav->footer();


