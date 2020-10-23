<?php

require_once('include/sangaku.inc');

$params = get_params();

if ($params->is_valid) {
 show_questions_page($params);
} else {
 select_session_page($params);
}

exit;

//////////////////////////////////////////////////////////////////////

function get_params() {
 global $sangaku;
 
 $params = $sangaku->get_session_student_params();

 return($params);
}

//////////////////////////////////////////////////////////////////////

function select_session_page($params) {
 echo "Not yet implemented";

 pre_print($params); exit;
 echo "<pre>";
 echo "session_id: " . $params->session_id . PHP_EOL; 
 echo "session: " . $params->session->id . PHP_EOL; 
 echo "session_student->session_id " . $params->session_student->session_id . PHP_EOL;
 echo "student_id: " . $params->student_id . PHP_EOL; 
 echo "student: " . $params->student->id . PHP_EOL; 
 echo "session_student->student_id " . $params->session_student->student_id . PHP_EOL;
 echo "session_student_id: " . $params->session_student_id . PHP_EOL; 
 echo "session_student: " . $params->session_student->id . PHP_EOL;
 echo "secret: " . $params->secret . PHP_EOL;
 echo "session_student->secret: " . $params->session_student->secret . PHP_EOL;
 echo "</pre>";
}

//////////////////////////////////////////////////////////////////////

function show_questions_page($params) {
 global $sangaku,$user;

 $b = $sangaku->nav->top_menu(); 
 $m = $sangaku->nav->mathjax_script();
 
 if (! $params->item_id) { $params->item_id = 0; }
 
 echo <<<HTML
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8">
$m
  <script src="js/ckeditor/ckeditor.js"></script>
  <script src="js/qrcodejs/qrcode.min.js"></script>
  <script src="js/frog.js"></script>
  <script src="js/objects_auto.js"></script>
  <script src="js/sangaku.js"></script>
  <script src="js/uploader.js"></script>
  <script src="js/tutor_sheet_viewer.js"></script>
  <link rel="stylesheet" href="css/sangaku.css">
 </head>
 <body>
$b
 <br/>
  <script>
   var v = Object.create(sangaku.tutor_sheet_viewer);
   v.init({$params->session_id},{$params->student_id},{$params->item_id},{$user->id});
  </script>
 </body>
</html>

HTML;

 
}
