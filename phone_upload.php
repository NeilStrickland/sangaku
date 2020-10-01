<?php

require_once('include/sangaku.inc');

$params = get_params();

if ($params->is_valid) {
 upload_page($params);
}

exit;

//////////////////////////////////////////////////////////////////////

function get_params() {
 global $sangaku;
 
 $params = $sangaku->get_session_student_params();
 $params->is_valid = $params->is_valid && $params->item_id;
 
 return($params);
}

//////////////////////////////////////////////////////////////////////

function upload_page($params) {
 global $sangaku;
 $session = $params->session;
 $student = $params->student;
 $item = $params->item;
 
 echo <<<HTML
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="js/frog.js"></script>
  <script src="js/objects_auto.js"></script>
  <script src="js/sangaku.js"></script>
  <script src="js/uploader.js"></script>
  <script src="js/phone_upload.js"></script>
  <link rel="stylesheet" href="css/sangaku.css">
 </head>
 <body>
  <h1>{$student->full_name} {$item->full_header}</div>
  <script>
   sangaku.phone_upload_page.session_id = '{$params->session->id}';
   sangaku.phone_upload_page.student_id = '{$params->student->id}';
   sangaku.phone_upload_page.item_id = '{$params->item->id}';
   sangaku.phone_upload_page.init();
  </script>
 </body>
</html>

HTML
  ;
}
