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
 
  echo <<<HTML
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8">
  <script>MathJax = { tex : { inlineMath : [['$','$'],['\\\\(','\\\\)']] }};</script>
  <script id="MathJax-script" async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <script src="js/ckeditor/ckeditor.js"></script>
  <script src="js/qrcodejs/qrcode.min.js"></script>
  <script src="js/frog.js"></script>
  <script src="js/objects_auto.js"></script>
  <script src="js/sangaku.js"></script>
  <script src="js/session_monitor.js"></script>
  <link rel="stylesheet" href="css/sangaku.css">
 </head>
 <body style="width:100%">
$b<br/>
  <script>
   var v = Object.create(sangaku.session_monitor);
   v.init({$session->id});
  </script>
 </body>
</html>

HTML;
}
