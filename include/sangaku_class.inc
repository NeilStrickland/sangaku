<?php

class sangaku_class extends frog {
 var $name = 'sangaku';
 var $data_dir = null;
 var $db_port = null;
 var $date_info_url = null;

 function time() {
  if (isset($this->fake_time) && $this->fake_time) {
   return $this->fake_time;
  } else {
   return time();
  }
 }
 
 function get_session_student_params($p = null) {
  global $user,$sangaku;
  
  if ($p) {
   $params = $p;
  } else {
   $params = new stdClass();
  }

  $params->is_valid = false;

  $student_id = (int) get_optional_parameter('student_id',0);
  if (! $student_id) {
   $student_id = $user->id;
  }
  
  $student = $this->load('user',$student_id);
  if (! $student) {
   $params->error = 'Student not found';
   return $params;
  }

  $student->load_sessions();
  
  $session_id = (int) get_optional_parameter('session_id',0);

  if ((! $session_id) && count($student->current_sessions) == 1) {
   $session_id = $student->current_sessions[0]->id;
  }
  
  if (! $session_id) {
   $params->error = 'No session specified';
   return $params;
  }

  $session = $sangaku->load('session',$session_id);
  if (! $session) {
   $params->error = 'Session not found';
   return $params;
  }
  
  if (! $student->is_fake_student() && ! $session->is_confirmed) {
   $params->error = 'Session is unconfirmed';
   return $params;
  }
  
  $group = $session->load_link('tutorial_group');
  if (! $group) {
   $params->error = 'Tutorial group not found';
   return $params;
  }

  if (false && ! $group->is_student_member($student_id)) {
   $params->error = 'Student is not a member of the tutorial group';
   return $params;
  }

  if ($student_id == $user->id) {
   $params->user_is_student = true;
  } else {
   if ($user->status != 'teacher') {
    $params->error = 'User is not a teacher';
    return $params;
   }
  }
  
  $item = $this->get_object_parameter('item','question_item');

  $params->is_valid = true;
  $params->session = $session;
  $params->student = $student;
  $params->tutorial_group = $group;
  $params->item = $item;
  $params->session_id = $session->id;
  $params->student_id = $student->id;
  $params->item_id = $item ? $item->id : null;  

  return $params;
 }

 function get_date_info() {
  $date_info_file = $this->data_dir . '/date_info.json';
  $this->date_info = null;
  $is_stale = 1;
  if (file_exists($date_info_file)) {
   $json = file_get_contents($date_info_file);
   $is_stale = time() - filemtime($date_info_file) >= 3600;
  }

  if ($is_stale && $this->date_info_url) {
   $json0 = file_get_contents($this->date_info_url);
   if ($json0) {
    $json = $json0;
    file_put_contents($date_info_file,$json);
   }
  }

  if ($json) {
   $this->date_info = json_decode($json);
  }
  
  return $this->date_info;
 }

 function week_number($t = 0) {
  if (! $t) { $t = $this->time(); }

  if (! isset($this->date_info)) { $this->get_date_info(); }

  $d = $this->date_info;
  if (! $d) { return 0; }
  
  for ($i = 1; $i <= 2; $i++) {
   for ($j = 0; $j <= 12; $j++) {
    $t0 = $d->week_start_time[$i][$j];
    if ($t0 <= $t && $t < $t0 + 7 * 24 * 3600) {
     return array($i,$j);
    }
   }
  }

  return false;
 }

 function academic_timestamp($semester,$week_number,$day_number,$hour) {
  if (! isset($this->date_info)) { $this->get_date_info(); }
  $d = $this->date_info;
  if (! $d) { return 0; }

  $t0 = $d->week_start_time[$semester][$week_number];
  $t1 = strtotime("+" . ($day_number - 1) . " days +" . $hour . " hours",$t0);

  return $t1;
 }

 function academic_time($semester,$week_number,$day_number,$hour) {
  $t = $this->academic_timestamp($semester,$week_number,$day_number,$hour);
  return $t ? date('Y-m-d H:i:s',$t) : '';
 }
}
