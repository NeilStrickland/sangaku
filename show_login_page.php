<?php

require_once('include/sangaku.inc');

$session_id = (int) get_optional_parameter('session_id',0);
if ($session_id) {
 $session = $sangaku->load('session',$session_id);
 $session->load_associated();
} else {
 $session = null;
}

if ($session) {
 show_login_page($session);
} else {
 choose_session_page();
}

//////////////////////////////////////////////////////////////////////

function choose_session_page() {
 echo "Not yet implemented";
}

//////////////////////////////////////////////////////////////////////

function show_login_page($session) {
 global $sangaku;

 $title = '';
 
 if ($session->is_lecture) {
  $title .= $session->module_code . ' Lecture';
 } elseif ($session->tutorial_group_name) {
  $title .= 'Group ' . $session->module_code . ' (' .
         $session->tutorial_group_name . ')';
 } else {
  $title .= $session->module_code;
 }
 
 $student_login_url =
   'https://' . $_SERVER['HTTP_HOST'] . '/sangaku/' . $session->id;

 echo <<<HTML
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8">
  <script src="js/qrcodejs/qrcode.min.js"></script>
  <script src="js/show_login.js"></script>
  <link rel="stylesheet" href="css/sangaku.css">
 </head>
 <body style="width:100%">
  <br/><br/>
  <h1>{$title}</h1>
  <div style="font-size:200%">iSheffield check-in code: {$session->check_in_code}</div>
  <br/>
  <div style="font-size:200%">URL for polls: <span id="poll_url">{$student_login_url}</span></div> 
  </div>
  <br/>
  <div id="poll_qr"></div>
  <script>
   var poll_url = document.getElementById('poll_url');
   var poll_qr = document.getElementById('poll_qr');
   new QRCode(poll_qr,{text : poll_url.innerText, width: 512, height : 512});
  </script>
 </body>
</html>

HTML
;
}

