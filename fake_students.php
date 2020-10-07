<?php

require_once('include/sangaku.inc');

$params = get_params();

if ($params->clear_data) {
 clear_data_page($params);
} else {
 choose_student_page($params);
}

exit;

//////////////////////////////////////////////////////////////////////

function get_params() {
 global $sangaku;
 
 $params = new stdClass();
 $params->session = $sangaku->get_object_parameter('session');
 $params->session->load_link('problem_sheet');
 $params->session->load_link('tutorial_group');

 $params->clear_data = get_optional_parameter('clear_data',0) ? 1 : 0;
 $params->fake_students =
   $sangaku->load_where('users',"x.username LIKE 'fake%'");

 return $params;
}

function choose_student_page($params) {
 global $sangaku;
 $N = $sangaku->nav;
 $H = $sangaku->html;

 $session = $params->session;
 $group = $session->tutorial_group;
 $sheet = $session->problem_sheet;
 
 echo $N->header('Fake students',array('widgets'=>array('mathjax')));

 echo $N->top_menu();
 
 $h = $session->module_code .
    '(' . $group->name . '): ' . $sheet->title .
    ' ' . date('D j/n H:i',strtotime($session->start_time));
 
 echo <<<HTML
<h1>$h</h1>
<br/>
<div class="text">
Use the links below to open the session as a fake student.
Fake students can access the session before it is open to
real students.  They depend on your authentication and do 
not have to log in separately.  You should click the button 
at the bottom to delete data associated with fake students
before the session officially starts.
</div>
<br/><br/>
<table class="edged">

HTML
  ;
 echo $H->spacer_row('60',300);
  
 foreach($params->fake_students as $s) {
  $url = "problem_sheet.php?session_id={$session->id}&student_id={$s->id}";
  echo $H->tr($H->popup_td($s->username,$url) . $H->td($s->full_name));
 }

 echo <<<HTML
</table>
<br/>

HTML
  ;

 $url = "fake_students.php?session_id={$session->id}&clear_data=1";

 echo <<<HTML
<button onclick="document.location='$url'">
Clear fake data
</button>

HTML
  ;
 echo $N->footer();
}

function clear_data_page($params) {
 global $sangaku;
 $N = $sangaku->nav;
 $H = $sangaku->html;

 $session = $params->session;
 $group = $session->tutorial_group;
 $sheet = $session->problem_sheet;
 $session->clear_fake_data();
 
 echo $N->header('Fake students');

 $url = "fake_students.php?session_id={$session->id}";

 echo <<<HTML
Data associated with fake students has been deleted.
<br/><br/>
<button onclick="document.location='$url'">Return to fake students page</button>

HTML
  ;
 echo $N->footer();
}
