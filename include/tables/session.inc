<?php

global $sangaku;

$sangaku->add_table(
 'session','sessions',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'problem_sheet_id' => array('type' => 'integer','link' => 'problem_sheet'),
  'tutorial_group_id' => array('type' => 'integer','link' => 'tutorial_group'),
  'start_time' => array('type' => 'text'),
  'duration' => array('type' => 'integer','default' => 50,'notnull' => true)
 ),
 array(
  'problem_sheet_title' => array('type' => 'text'),
  'tutorial_group_name' => array('type' => 'text'),
  'module_code' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.problem_sheet_id,
 p.title AS problem_sheet_title,
 x.tutorial_group_id,
 g.name AS tutorial_group_name,
 m.code AS module_code,
 m.title AS module_title, 
 x.start_time,
 x.duration
FROM tbl_sessions x
 LEFT JOIN tbl_problem_sheets p ON x.problem_sheet_id = p.id 
  LEFT JOIN tbl_tutorial_groups g ON x.tutorial_group_id = g.id
   LEFT JOIN tbl_modules m ON p.module_id = m.id
WHERE %s
 ORDER BY x.start_time,m.code,g.name
 
SQL
);

class session extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'session',$id,$with_defaults);
 }

 function start_timestamp() {
  if ($this->start_time) {
   return strtotime($this->start_time);
  } else {
   return 0;
  }
 }
 
 function end_timestamp() {
  if ($this->start_time && $this->duration) {
   return $this->start_timestamp() + 60 * $this->duration;
  } else {
   return 0;
  }
 }

 function end_time() {
  $t = $this->end_timestamp();
  if ($t) {
   return date('Y-m-d H:m:s',$t);
  } else {
   return null;
  }
 }

 function is_current($leeway = 600) {
  $t0 = $this->start_timestamp();
  $t1 = $this->end_timestamp();
  $t = time();

  if ($t0 && $t1 && ($t0 - $leeway <= $t) && ($t <= $t1 + $leeway)) {
   return true;
  } else {
   return false;
  }
 }

 function is_future($leeway = 600) {
  $t1 = $this->end_timestamp();
  $t = time();

  if ($t1 && ($t <= $t1 + $leeway)) {
   return true;
  } else {
   return false;
  }
 }

 function is_unlimited() {
  return ($this->start_time == '');
 }

 function url($student_id = 0) {
  global $user;

  $id = $student_id ? $student_id : $user->id;
  
  return '/sangaku/problem_sheet.php' .
         '?session_id=' . $this->id .
          '&student_id=' . $id;
 }
 
 function teacher_url() {
  global $user;

  return '/sangaku/session_monitor.php' .
         '?session_id=' . $this->id .
          '&teacher_id=' . $user->id;
 }
 
 function load_associated() {
  $p = $this->load_link('problem_sheet');
  $g = $this->load_link('tutorial_group');
  $p->load_question_items();
  $g->load_students();
  $g->load_teachers();

  foreach($g->students as $s) {
   $s->load_status($this);
  }
 } 

 function clear_fake_data() {
  global $sangaku;
  
  $this->load_associated();

  $item_ids = array();
  foreach($this->problem_sheet->question_items as $item) {
   $item_ids[] = $item->id;
  }

  if (! $item_ids) { return null; }

  $item_ids = implode(',',$item_ids);
  $status_reports = $sangaku->load_where('status_reports',
                                         "x.item_id IN ({$item_ids})");

  foreach($status_reports AS $r) {
   if (strlen($r->student_username) >= 4 &&
       substr($r->student_username,0,4) == 'fake') {
    $r->delete();
   }
  }

  $uploads = $sangaku->load_where('uploads',
                                         "x.item_id IN ({$item_ids})");

  foreach($uploads AS $u) {
   if (strlen($u->student_username) >= 4 &&
       substr($u->student_username,0,4) == 'fake') {
    $u->delete();
   }
  }  
 }
 
 function for_json() {
  $x = new stdClass();
  $x->id = $this->id;
  $x->problem_sheet_id = $this->problem_sheet_id;
  $x->tutorial_group_id = $this->tutorial_group_id;
  $x->start_time      = $this->start_time;
  $x->end_time        = $this->end_time();
  $x->start_timestamp = $this->start_timestamp();
  $x->end_timestamp   = $this->end_timestamp();
  $x->duration        = $this->duration;
  
  if (isset($this->problem_sheet)) {
   $x->problem_sheet = $this->problem_sheet->for_json();
  }

  if (isset($this->tutorial_group)) {
   $x->tutorial_group = $this->tutorial_group->for_session_json();
  }
  
  return ($x);
 }

 function to_json() {
  return json_encode($this->for_json());
 }
}
