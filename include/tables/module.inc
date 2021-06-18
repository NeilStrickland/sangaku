<?php

global $sangaku;

$sangaku->add_table(
 'module','modules',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'somas_moid' => array('type' => 'integer'),
  'code' => array('type' => 'text'),
  'title' => array('type' => 'text'),
  'is_regular' => array('type' => 'boolean','default' => 1),
  'semester' => array('type' => 'text'),
  'blackboard_url' => array('type' => 'text')
 ),
 array(
  'coded_title' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.somas_moid,
 x.code,
 x.title,
 CONCAT(x.code,' (',x.title,')') AS coded_title,
 x.is_regular,
 x.semester,
 x.blackboard_url
FROM tbl_modules x
WHERE %s
 ORDER BY x.code,x.title,x.id
 
SQL
);

class module extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'module',$id,$with_defaults);
 }

 function descriptor() {
  if ($this->code) {
   if ($this->title) {
    return "{$this->code} ({$this->title})";
   } else {
    return $this->code
   }
  } elseif ($this->title) {
   return $this->title;
  } elseif ($this->id) {
   return "Module [{$this->id}]";
  } else {
   return "New module";
  }
 }

 function load_tutorial_groups($semester='',$force = false) {
  global $sangaku;

  if ($force || ! isset($this->tutorial_groups)) {
   $w = "x.module_id={$this->id}";

   if ($semester) {
    $w .= " AND x.semester='$semester'";
   }
   
   $this->tutorial_groups =
    $sangaku->load_where_indexed('tutorial_groups',$w);
  }

  return $this->tutorial_groups;
 }

 function load_problem_sheets($semester='',$force = false) {
  global $sangaku;

  if ($force || ! isset($this->problem_sheets)) {
   $w = "x.module_id={$this->id}";

   if ($semester) {
    $w .= " AND x.semester='$semester'";
   }
   
   $this->problem_sheets =
    $sangaku->load_where_indexed('problem_sheets',$w);
  }

  return $this->problem_sheets;
 }

 function load_sessions($semester='',$force = false) {
  global $sangaku;
  
  if ($force || ! isset($this->sessions)) {
   $this->sessions = array();

   $this->load_tutorial_groups($semester);
   $this->load_problem_sheets($semester);

   foreach($this->tutorial_groups as $x) {
    $x->sessions = array();
    $x->confirmed_sessions = array();
   }

   foreach($this->problem_sheets  as $x) {
    $x->sessions = array();
    $x->confirmed_sessions = array();
   }

   $w = "g.module_id={$this->id}";
   if ($semester) {
    $w .= " AND g.semester='$semester'";
   }
   
   $this->sessions =
     $sangaku->load_where('sessions',$w);

   $this->confirmed_sessions = array();
   
   foreach($this->sessions as $s) {
    if ($s->is_confirmed) {
     $this->confirmed_sessions[] = $s;
    }
    
    if (isset($this->tutorial_groups[$s->tutorial_group_id])) {
     $g = $this->tutorial_groups[$s->tutorial_group_id];
     $g->sessions[] = $s;
     if ($s->is_confirmed) {
      $g->confirmed_sessions[] = $s;
     }
    }
    if (isset($this->problem_sheets[$s->problem_sheet_id])) {
     $p = $this->problem_sheets[$s->problem_sheet_id];
     $p->sessions[] = $s;
     if ($s->is_confirmed) {
      $p->confirmed_sessions[] = $s;
     }
    }
   }

   $this->sessions_by_semester = array(1 => array(),2 => array());
   $this->sessions_by_week = array(1 => array(),2 => array());
   for ($i = 1; $i <= 2; $i++) {
    for ($j = 0; $j <= 12; $j++) {
     $this->sessions_by_week[$i][$j] = array();
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
    }
   }
  }

  return $this->sessions;
 }

 function load_students() {
  global $sangaku;
  
  $this->students = array();
  $this->registrations = array();
  $this->group_memberships = array();
  $this->students_by_id = array();
  $this->students_by_username = array();
  $this->students_by_somas_id = array();

  $this->registrations = $sangaku->load_where(
   'registrations',
   "x.module_id={$this->id}"
  );

  foreach($this->registrations as $r) {
   $s = $r->load_link('student');
   if (! $s) { $r->delete(); continue; }
   $s->tutorial_group_id = null;
   $s->tutorial_group_name = '';
   $this->students[] = $s;
   $this->students_by_id[$s->id] = $s;
   $this->students_by_username[$s->username] = $s;
   $this->students_by_somas_id[$s->somas_student_id] = $s;
  }

  $this->group_memberships = $sangaku->load_where(
   'tutorial_group_students',
   "m.id={$this->id}"
  );

  foreach($this->group_memberships as $m) {
   if (isset($this->students_by_id[$m->student_id])) {
    $s = $this->students_by_id[$m->student_id];
    $m->student = $s;
    $s->tutorial_group_id = $m->tutorial_group_id;
    $s->tutorial_group_name = $m->tutorial_group_name;
   }
  }
 }
}
