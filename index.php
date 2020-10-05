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

$style = <<<CSS
td.module_code { width: 60px; vertical-align : top; }
td.group_name { width: 60px;  vertical-align : top; }
td.sheet_name { width: 300px;  vertical-align : top; }
td.session_link { width : 100px; }

CSS
 ;

echo $sangaku->nav->header(
'Sessions',
array('widgets' => array('mathjax'),
      'inline_style' => $style)
);

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
  <td class="command session_link" onclick="location='{$url}'">$t</td>

HTML;
  } else {
   $t = date('D j/n H:i',$s->start_timestamp());
   $x = <<<HTML
  <td class="session_link">$t</td>

HTML;
  }
  
  echo <<<HTML
 <tr>
  <td class="module_code">{$s->module_code}</td>
  <td class="group_name">{$s->tutorial_group_name}</td>
  <td class="sheet_name">{$s->problem_sheet_title}</td>
$x
 </tr>

HTML;
 }

 foreach($user->unlimited_sessions as $s) {
  echo <<<HTML
 <tr>
  <td class="module_code">{$s->module_code}</td>
  <td class="group_name">{$s->tutorial_group_name}</td>
  <td class="sheet_name">{$s->problem_sheet_title}</td>
  <td class="session_link">&nbsp;</td>
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
  <td class="module_code">{$s->module_code}</td>
  <td class="group_name">{$s->tutorial_group_name}</td>
  <td class="sheet_name">{$s->problem_sheet_title}</td>
$x
 </tr>

HTML;
 }

 foreach($user->unlimited_teacher_sessions as $s) {
  echo <<<HTML
 <tr>
  <td class="module_code">{$s->module_code}</td>
  <td class="group_name">{$s->tutorial_group_name}</td>
  <td class="sheet_name">{$s->problem_sheet_title}</td>
  <td class="session_link">&nbsp;</td>
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


