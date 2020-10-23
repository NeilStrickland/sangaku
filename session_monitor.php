<?php

require_once('include/sangaku.inc');

$session_id = (int) get_required_parameter('session_id');
if ($session_id) {
 $session = $sangaku->load('session',$session_id);
} else {
 $session = null;
}

if ($session) {
 show_status_page($session);
} else {
 choose_session_page();
}

//////////////////////////////////////////////////////////////////////

function choose_session_page() {
 echo "Not yet implemented";
}

//////////////////////////////////////////////////////////////////////

function show_status_page($session) {
 global $sangaku;
 
 $b = $sangaku->nav->top_session_menu($session->id);
 $m = $sangaku->nav->mathjax_script();
 $u = 'https://' . $_SERVER['HTTP_HOST'] . '/sangaku/' . $session->id;
    
  echo <<<HTML
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8">
$m
  <script src="js/qrcodejs/qrcode.min.js"></script>
  <script src="js/frog.js"></script>
  <script src="js/objects_auto.js"></script>
  <script src="js/sangaku.js"></script>
  <script src="js/session_monitor.js"></script>
  <link rel="stylesheet" href="css/sangaku.css">
 </head>
 <body style="width:100%">
$b<br/><br/>
  <div style="width:700px">
   Student login URL:
   <code id="login_url" style="color: blue; font-size: 150%">{$u}</code>
   <button type="button" onclick="copy_login_url()">Copy</button><br/>
   Share this URL in Blackboard Collaborate chat.  Remember that students
   cannot see messages posted before they joined the session, so you should
   share the URL several times.
  </div>
  <script>
   var v = Object.create(sangaku.session_monitor);
   v.init({$session->id});

   function copy_login_url() {
    var e = document.getElementById('login_url');
    var t = document.createElement('textarea');
    t.className = 'temp';
    t.value = e.innerText;
    document.body.appendChild(t);
    t.focus(); 
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
   }
  </script>
 </body>
</html>

HTML;
}
