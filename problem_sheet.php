<?php

require_once('include/sangaku.inc');

$params = get_params();

if ($params->is_valid) {
 show_questions_page($params);
} else {
 echo "Error: {$params->error}";
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
}

//////////////////////////////////////////////////////////////////////

function show_questions_page($params) {
 global $sangaku;
 
 $b = $sangaku->nav->top_menu();
 
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
  <script src="js/uploader.js"></script>
  <script src="js/sheet_viewer.js"></script>
  <link rel="stylesheet" href="css/sangaku.css">
 </head>
 <body>
  <br/>
$b
  <script>
   var v = Object.create(sangaku.sheet_viewer);
   v.init({$params->session_id},{$params->student_id});
  </script>
 </body>
</html>

HTML;

 
}
