<?php

class sangaku_class extends frog {

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
  
  if (false) {
   $session_id = (int) get_optional_parameter('session_id',0);

   if ((! $session_id) && count($student->current_sessions) == 1) {
    $session_id = $student->current_sessions[0]->id;
   }

   if (! $session_id) {
    $params->error = 'No session specified';
    return $params;
   }
  } else {
   $session_id = 371;
  }

  $session = $sangaku->load('session',$session_id);
  if (! $session) {
   $params->error = 'Session not found';
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
   if (! $group->is_teacher_member($user->id)) {
    $params->error = 'User is not a teacher for this tutorial group';
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
}
