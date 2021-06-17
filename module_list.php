<?php

require_once('include/sangaku.inc');

$params = get_params();

$N = $sangaku->nav;
$H = $sangaku->html;

echo $N->header('Courses');

$c = $params->include_empty ? ' checked="checked"' : '';

echo $N->top_menu();

echo <<<HTML
<h1>Courses</h1>
<br/>
<form name="control_form">
 Include courses with no Sangaku sessions
 <input name="include_empty" type="checkbox"$c
  onclick="document.control_form.submit()"/>
</form>
<br/>
<h2>My Courses</h2>
<table class="edged">

HTML;

echo $H->spacer_row(150,400);

foreach($params->user_modules as $m) {
 echo $H->tr($H->link_td($m->code,"module_info.php?id={$m->id}") .
             $H->td($m->title));
}

echo <<<HTML
</table>
<br/>
<h2>Other Courses</h2>
<table class="edged">

HTML;

echo $H->spacer_row(150,400);
foreach($params->other_modules as $m) {
 echo $H->tr($H->link_td($m->code,"module_info.php?id={$m->id}") .
             $H->td($m->title));
}

echo <<<HTML
</table>

HTML;

echo $N->footer();

exit;

//////////////////////////////////////////////////////////////////////

function get_params() {
 global $sangaku,$user;

 $params = new stdClass();

 $params->include_empty =
  get_optional_parameter('include_empty',0) ? 1 : 0;

 $params->modules = $sangaku->load_all('modules');

 $q = <<<SQL
SELECT DISTINCT g.module_id
FROM tbl_tutorial_groups g 
 LEFT JOIN tbl_tutorial_group_teachers l ON l.tutorial_group_id=g.id
WHERE l.teacher_id={$user->id}
SQL;
 
 $teacher_links = make_index($sangaku->get_all($q),'module_id');

 $student_links =
   $sangaku->load_where_indexed(
    'registrations',
    "x.student_id={$user->id}",
    "module_id"
   );

 $params->users_modules = array();
 $params->other_modules = array();

 foreach($params->modules as $m) {
  if (! $params->include_empty) {
   $m->load_sessions();
   if (! $m->sessions) { continue; }
  }
  
  if (isset($teacher_links[$m->id]) ||
      isset($student_links[$m->id])) {
   $params->user_modules[] = $m;
  } else {
   $params->other_modules[] = $m;
  }
 }

 return $params;
}
