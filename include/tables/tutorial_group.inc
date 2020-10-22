<?php

global $sangaku;

$sangaku->add_table(
 'tutorial_group','tutorial_groups',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'somas_id' => array('type' => 'integer'),
  'module_id' => array('type' => 'integer','link' => 'module'),
  'name' => array('type' => 'text'),
  'day_number' => array('type' => 'integer'),
  'hour' => array('type' => 'integer'),
  'week_parity' => array('type' => 'text')
 ),
 array(
  'module_code' => array('type' => 'text'),
  'module_title' => array('type' => 'text'),
  'somas_moid' => array('type' => 'integer')
 ),
 <<<SQL
SELECT
 x.id,
 x.somas_id,
 x.module_id,
 m.code AS module_code,
 m.title AS module_title,
 m.somas_moid,
 x.name,
 x.day_number,
 x.hour,
 x.week_parity
FROM tbl_tutorial_groups x
 LEFT JOIN tbl_modules m ON x.module_id = m.id
WHERE %s
 ORDER BY m.code, x.name
 
SQL
);

class tutorial_group extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'tutorial_group',$id,$with_defaults);
 }

 function day_letter() {
  if ($this->day_number) {
   return array('','M','T','W','R','F','','')[$this->day_number];
  } else {
   return '';
  }
 }
 
 function day_name() {
  if ($this->day_number) {
   return array('Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun')[$this->day_number];
  } else {
   return '';
  }
 }

 function week_parity_long() {
  if ($this->week_parity == 'e') {
   return 'even';
  } elseif  ($this->week_parity == 'o') {
   return 'odd';
  } else {
   return '';
  }
 }
 
 function load_teachers() {
  global $sangaku;

  $this->teacher_links =
   $sangaku->load_where_indexed('tutorial_group_teachers',
                                "x.tutorial_group_id={$this->id}");

  $this->teachers = array();
  $this->teachers_by_username = array();

  foreach($this->teacher_links as $x) {
   $teacher = $x->load_teacher();
   $this->teachers[] = $teacher;
   $this->teachers_by_username[$teacher->username] = $teacher;
  }

  return($this->teachers);
 }

 function load_students($include_fake = 1) {
  global $sangaku;

  $this->student_links =
   $sangaku->load_where_indexed('tutorial_group_students',
                                "x.tutorial_group_id={$this->id}");

  $this->students = array();
  $this->students_by_username = array();

  foreach($this->student_links as $x) {
   $student = $x->load_student();
   if (! $student) {
    $x->dump(); exit;
   }
   $this->students[] = $student;
   $this->students_by_username[$student->username] = $student;
  }

  if ($include_fake) {
   $students = $sangaku->load_where('user',"x.username LIKE('fake%')");
   foreach($students as $student) {
    $this->students[] = $student;
    $this->students_by_username[$student->username] = $student;
   }
  }

  return($this->students);
 }

 function load_sessions() {
  global $sangaku;
  
  $this->sessions =
   $sangaku->load_where('sessions',"x.tutorial_group_id={$this->id}");

  $this->confirmed_sessions = array();
  $this->sessions_by_state = array('unfinished' => array());
  $this->confirmed_sessions_by_state = array('unfinished' => array());

  foreach(session::$time_states as $x) {
   $this->sessions_by_state[$x] = array();
   $this->confirmed_sessions_by_state[$x] = array();
  }

  foreach($this->sessions as $s) {
   $x = $s->get_time_state();
   $this->sessions_by_state[$x][] = $s;
   if ($x != 'finished') { $this->sessions_by_state['unfinished'][] = $s; }
   if ($s->is_confirmed) {
    $this->confirmed_sessions[] = $s;
    $this->confirmed_sessions_by_state[$x][] = $s;
    if ($x != 'finished') { $this->confirmed_sessions_by_state['unfinished'][] = $s; }
   }
  }

  $this->sessions_by_semester = array(1 => array(),2 => array());
  $this->sessions_by_week = array(1 => array(),2 => array());
  $this->confirmed_sessions_by_semester = array(1 => array(),2 => array());
  $this->confirmed_sessions_by_week = array(1 => array(),2 => array());
  
  for ($i = 1; $i <= 2; $i++) {
   for ($j = 0; $j <= 12; $j++) {
    $this->sessions_by_week[$i][$j] = array();
    $this->confirmed_sessions_by_week[$i][$j] = array();
   }
  }

  foreach($this->sessions as $s) {
   $s->start_timestamp = strtotime($s->start_time);
   $w = $sangaku->week_number($s->start_timestamp);
   if ($w == false) {
    $s->semester = null;
    $s->week_number = null;
   } else {
    $s->semester = $w[0];
    $s->week_number = $w[1];
    $this->sessions_by_semester[$w[0]][] = $s;
    $this->sessions_by_week[$w[0]][$w[1]][] = $s;
    if ($s->is_confirmed) {
     $this->confirmed_sessions_by_semester[$w[0]][] = $s;
     $this->confirmed_sessions_by_week[$w[0]][$w[1]][] = $s;
    }
   }
  }
  
  return $this->sessions;
 }
 
 function is_student_member($student_id) {
  global $sangaku;
  $w = "x.tutorial_group_id={$this->id} AND x.student_id={$student_id}";
  $x = $sangaku->load_where('tutorial_group_student',$w);
  return $x ? true : false;
 }
 
 function is_teacher_member($teacher_id) {
  global $sangaku;
  $w = "x.tutorial_group_id={$this->id} AND x.teacher_id={$teacher_id}";
  $x = $sangaku->load_where('tutorial_group_teacher',$w);
  return $x ? true : false;
 }

 function add_student_by_username($username) {
  global $sangaku;

  if (! preg_match('/[A-Za-z0-9]+/',$username)) {
   return(false);
  }
  
  $w = "x.username='{$username}' AND x.status='student'";
  $ss = $sangaku->load_where('user',$w);
  if (! $ss) { return false; }

  $s = $ss[0];
  return $this->add_student_by_id($s->id);
 }

 function add_student_by_id($id) {
  global $sangaku;

  $w = "x.student_id=" . ((int) $id) .
     " AND x.tutorial_group_id=" . $this->id;
  
  $rr = $sangaku->load_where('tutorial_group_students',$w);
  if ($rr) {
   return $rr[0];
  }

  $s = $sangaku->load('user',(int) $id);
  if (! ($s && $s->status == 'student')) { return false; }
  $r = $sangaku->new_object('tutorial_group_student');
  $r->student_id = (int) $id;
  $r->tutorial_group_id = $this->id;
  $r->save();
  $r->load();
  return $r;
 }
 
 function add_teacher_by_username($username) {
  global $sangaku;

  if (! preg_match('/[A-Za-z0-9]+/',$username)) {
   return(false);
  }
  
  $w = "x.username='{$username}' AND x.status='teacher'";
  $ss = $sangaku->load_where('user',$w);
  if (! $ss) { return false; }

  $s = $ss[0];
  return $this->add_teacher_by_id($s->id);
 }

 function add_teacher_by_somas_id($somas_id) {
  global $sangaku;

  $w = "x.somas_person_id=" . ((int) $somas_id) . " AND x.status='teacher'";
  $ss = $sangaku->load_where('user',$w);
  if (! $ss) { return false; }

  $s = $ss[0];
  return $this->add_teacher_by_id($s->id);
 }

 function add_teacher_by_id($id) {
  global $sangaku;

  $w = "x.teacher_id=" . ((int) $id) .
     " AND x.tutorial_group_id=" . $this->id;
  
  $rr = $sangaku->load_where('tutorial_group_teachers',$w);
  if ($rr) {
   return $rr[0];
  }

  $s = $sangaku->load('user',(int) $id);
  if (! ($s && $s->status == 'teacher')) { return false; }
  $r = $sangaku->new_object('tutorial_group_teacher');
  $r->teacher_id = (int) $id;
  $r->tutorial_group_id = $this->id;
  $r->save();
  $r->load();
  return $r;
 }
 
 function for_json() {
  $x = new stdClass();
  $x->id = $this->id;
  $x->module_id = $this->module_id;
  $x->module_code = $this->module_code;
  $x->module_title = $this->module_title;
  $x->name = $this->name;

  if (isset($this->teachers)) {
   $x->teachers = array();
   
   foreach($this->teachers as $t) {
    $x->teachers[] = $t->for_json();
   }
  }

  if (isset($this->students)) {
   $x->students = array();
   
   foreach($this->students as $s) {
    $x->students[] = $s->for_json();
   }
  }
  
  if (isset($this->sessions)) {
   $x->sessions = array();
   
   foreach($this->sessions as $s) {
    $x->sessions[] = $s->for_json();
   }
  }
  
  return ($x);
 }

 function to_json() {
  return json_encode($this->for_json());
 }

 function for_session_json() {
  $x = new stdClass();
  $x->id = $this->id;
  $x->module_id = $this->module_id;
  $x->module_code = $this->module_code;
  $x->module_title = $this->module_title;
  $x->name = $this->name;

  if (isset($this->teachers)) {
   $x->teachers = array();
   
   foreach($this->teachers as $t) {
    $x->teachers[] = $t->for_json();
   }
  }

  if (isset($this->students)) {
   $x->students = array();
   
   foreach($this->students as $s) {
    $x->students[] = $s->for_session_json();
   }
  }
  
  if (isset($this->sessions)) {
   $x->sessions = array();
   
   foreach($this->sessions as $s) {
    $x->sessions[] = $s->for_json();
   }
  }
  
  return ($x);
 }

 function to_session_json() {
  return json_encode($this->for_session_json());
 }
}

