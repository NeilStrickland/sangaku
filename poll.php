<?php

require_once('include/sangaku.inc');

$params = get_params();

if ($params->is_valid) {
 show_poll_page($params);
} else {
 echo "Error: {$params->error}";
}

exit;

//////////////////////////////////////////////////////////////////////

function get_params() {
 global $sangaku;
 
 // $params = $sangaku->get_session_student_params();

 $params->instance_id = (int) get_optional_parameter('instance_id',0);
 $params->instance = $sangaku->load('poll_instance',$params->instance_id);
 if (! $params->instance) {
  $params->instance_id = 0;
  $params->is_valid = 0;
  $params->error = 'Poll instance not found';
  return $params;
 }

 $params->poll = $params->instance->load_link('poll');

 if (! $params->poll) {
  $params->is_valid = 0;
  $params->error = 'Poll not found';
  return $params;  
 }
 
 $params->poll->load_items();

 $params->is_valid = 1;
 
 return($params);
}

//////////////////////////////////////////////////////////////////////

function show_poll_page($params) {
 global $sangaku,$user;
 
 $b = $sangaku->nav->top_menu();
 $m = $sangaku->nav->mathjax_script();

 echo <<<HTML
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8">
$m
  <script src="js/frog.js"></script>
  <script src="js/objects_auto.js"></script>
  <script src="js/sangaku.js"></script>
  <script src="js/poll_viewer.js"></script>
  <link rel="stylesheet" href="css/sangaku.css">
 </head>
 <body>
  <br/>
$b
  <script>
   var v = Object.create(sangaku.poll_viewer);
   v.init({$params->instance_id},{$user->id});
  </script>
 </body>
</html>

HTML;

 
}
