<?php

global $sangaku;

$sangaku->add_table(
 'registration','registrations',
 array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'student_id' => array('type' => 'integer','link' => 'user'),
  'module_id' => array('type' => 'integer','link' => 'module')
 ),
 array(
  'module_code' => array('type' => 'text'),
  'module_title' => array('type' => 'text'),
  'somas_moid' => array('type' => 'integer'),
  'username' => array('type' => 'text'), 
  'gmail_name' => array('type' => 'text'), 
  'surname' => array('type' => 'text'), 
  'forename' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.student_id,
 x.module_id,
 m.code AS module_code,
 m.title AS module_title,
 m.somas_moid,
 x.student_id,
 s.username,
 s.gmail_name,
 s.surname,
 s.forename
FROM tbl_registrations x
 LEFT JOIN tbl_users s ON x.student_id = s.id
  LEFT JOIN tbl_modules m ON x.module_id = m.id
WHERE %s
 ORDER BY m.code,s.surname,s.forename
 
SQL
);

class registration extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'registration',$id,$with_defaults);
 }

 function load_student() {
  global $sangaku;
  $this->student = $sangaku->load('user',$this->student_id);
  return $this->student;
 }

 function load_groups() {
  global $sangaku;
  $this->groups = $sangaku->load_where(
   'tutorial_group_students',
   "m.id={$this->module_id} AND x.student_id={$this->student_id}"
  );

  $this->groups_by_id   = make_index($this->groups,'tutorial_group_id');
  $this->groups_by_name = make_index($this->groups,'tutorial_group_name');
  
  if ($this->module_code == 'EngL1') {
   $this->group_a = null;
   $this->group_b = null;
   foreach($this->groups as $g) {
    $g0 = $g->load_link('tutorial_group');
    if ($g0->name == strtoupper($g0->name)) {
     $this->group_a = $g0;
    } else {
     $this->group_b = $g0;
    }
   }
  } else {
   $this->group = null;
   if ($this->groups) {
    $this->group = $this->groups[0]->load_link('tutorial_group');
   }
  }
 }

 function load_sessions($sem = 0,$week = 0) {
  global $sangaku;

  list($s0,$w0) =  $sangaku->week_number();
  $s = $sem ? $sem : $s0;
  $w = $week ? $week : $w0;
  
  if (! isset($this->groups)) {
   $this->load_groups();
  }

  $m = $this->load_link('module');

  $this->sheets = $sangaku->load_where(
   'problem_sheets',
   "module_id={$m->id} AND semester='{$s}' AND week_number={$w}"
  );

  foreach($this->sheets as $p) {
   $p->load_sessions();
   $p->group = null;
   
   if ($m->code == 'EngL1') {
    if (strlen($p->code) > 0 and substr($p->code,-1) == 'a') {
     $p->group = $this->group_a;
    }
    if (strlen($p->code) > 0 and substr($p->code,-1) == 'b') {
     $p->group = $this->group_b;
    }
   } else {
    $p->group = $this->group;
   }

   $p->approved_session = null;
   $p->unapproved_sessions = array();
   $p->unapproved_sessions_by_state = array();
   foreach(session::$time_states as $x) {
    $p->unapproved_sessions_by_state[$x] = array();
   }

   foreach ($p->sessions as $x) {
    if (array_key_exists($x->tutorial_group_id,$this->groups_by_id)) {
     $p->approved_session = $x;
    } else {
     $p->unapproved_sessions[] = $x;
     $p->unapproved_sessions_by_state[$x->time_state][] = $x;
    }
   }
  }
 }
}
