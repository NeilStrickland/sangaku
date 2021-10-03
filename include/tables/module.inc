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
  'video_url' => array('type' => 'text'),
  'video_url_description' => array('type' => 'text')
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
 x.video_url,
 x.video_url_description
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
    return $this->code;
   }
  } elseif ($this->title) {
   return $this->title;
  } elseif ($this->id) {
   return "Module [{$this->id}]";
  } else {
   return "New module";
  }
 }

 function load_associated() {
  $this->load_tutorial_groups();
  $this->load_problem_sheets();
  $this->load_polls();
  $this->load_sessions();
  $this->load_students();
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
  
  $this->tutorials = array();
  $this->online_tutorials = array();
  $this->offline_tutorials = array();
  $this->lectures = array();
  $this->online_lectures = array();
  $this->offline_lectures = array();

  foreach ($this->tutorial_groups as $g) {
   if ($g->is_lecture) {
    $this->lectures[] = $g;
    if ($g->is_online) {
     $this->online_lectures[] = $g;
    } else {
     $this->offline_lectures[] = $g;
    }
   } else {
    $this->tutorials[] = $g;
    if ($g->is_online) {
     $this->online_tutorials[] = $g;
    } else {
     $this->offline_tutorials[] = $g;
    }
   }
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

 function load_polls($semester='',$force = false) {
  global $sangaku;

  if ($force || ! isset($this->polls)) {
   $w = "x.module_id={$this->id}";

   if ($semester) {
    $w .= " AND p.semester='$semester'";
   }
   
   $this->polls = $sangaku->load_where('polls',$w);
   $this->polls_by_id = make_index($this->polls,'id');
  }

  return $this->polls;
 }

 function load_sessions($semester='',$force = false) {
  global $sangaku;
  
  if ($force || ! isset($this->sessions)) {
   $this->sessions = array();

   $this->load_tutorial_groups($semester);
   $this->load_problem_sheets($semester);

   foreach($this->tutorial_groups as $x) {
    $x->sessions = array();
    $x->sessions_by_datetime = array();
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
   
   $this->sessions = $sangaku->load_where('sessions',$w);

   $this->confirmed_sessions = array();
   
   foreach($this->sessions as $s) {
    if ($s->is_confirmed) {
     $this->confirmed_sessions[] = $s;
    }
    
    if (isset($this->tutorial_groups[$s->tutorial_group_id])) {
     $g = $this->tutorial_groups[$s->tutorial_group_id];
     $g->sessions[] = $s;
     $g->sessions_by_datetime[$s->date . ' ' . $s->time] = $s;
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
    $w = $sangaku->week_number($s->start_timestamp());
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

 function create_lecture_sessions($semester = '') {
  global $sangaku;

  $new_sessions = array();
  
  if (! $semester) {
   $ns1 = $this->create_lecture_sessions('1');
   $ns2 = $this->create_lecture_sessions('2');
   return array_merge($ns1,$ns2);
  }

  $t = $sangaku->load('module',$this->id);
  $t->load_tutorial_groups($semester);
  $t->load_sessions($semester);
  
  if ($semester == '1') {
   $weeks = array(1,2,3,4,5,6,8,9,10,11,12);
  } else {
   $weeks = array(1,2,3,4,5,6,7,8,9,10,11);
  }

  $lecture_sessions = array();
  
  foreach ($t->lectures as $g) {
   if (! ($g->day_number && $g->hour)) { continue; }
   
   foreach($weeks as $w) {
    $ts = $sangaku->academic_timestamp(
     $semester,$w,$g->day_number,$g->hour
    );
    $dt = date('Y-m-d H:i:s',$ts);
    if (! array_key_exists($dt,$g->sessions_by_datetime)) {
     $s = $sangaku->new_object('session');
     $s->tutorial_group_id = $g->id;
     $s->date = date('Y-m-d',$ts);
     $s->time = date('H:i:s',$ts);
     $s->duration = 50;
     $s->save();
     $s->load();
     $g->sessions_by_datetime[$dt] = $s;
     $new_sessions[] = $s;
    }
   }
  }

  return $new_sessions;
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
   $s->registration = $r;
   $s->tutorial_group_id = null;
   $s->tutorial_group_name = '';
   $s->tutorial_group_membership = null;
   $this->students[] = $s;
   $this->students_by_id[$s->id] = $s;
   $this->students_by_username[$s->username] = $s;
   if ($s->somas_student_id) {
    $this->students_by_somas_id[$s->somas_student_id] = $s;
   }
  }

  $this->group_memberships = $sangaku->load_where(
   'tutorial_group_students',
   "m.id={$this->id}"
  );

  foreach($this->group_memberships as $m) {
   if (isset($this->students_by_id[$m->student_id])) {
    $s = $this->students_by_id[$m->student_id];
    $s->tutorial_group_membership = $m;
    $m->student = $s;
    $s->tutorial_group_id = $m->tutorial_group_id;
    $s->tutorial_group_name = $m->tutorial_group_name;
   }
  }
 }

 function add_student($student_id) {
  global $sangaku;

  $q = <<<SQL
x.module_id={$this->id} AND
x.student_id={$student_id}  
SQL;
  
  $rr = $sangaku->load_where('registration',$q);

  if ($rr) {
   return $rr[0];
  } else {
   $r = $sangaku->new_object('registration');
   $r->module_id = $this->id;
   $r->student_id = $student_id;
   $r->save();
   return $r;
  }
 }

 function tutorial_group_selector($field_name,$id='',$opts=null) {
  global $sangaku;
  $H = $sangaku->html;

  $semester = '';
  if (isset($opts['semester'])) {
   $semester = $opts['semester'];
  }

  $groups = $this->load_tutorial_groups($semester);

  $opts0 = array(
   'onchange' => '',
   'onfocus' => '',
   'onblur' => '',
   'width' => '',
   'mode' => 'indirect',
   'index' => 'id',
   'display' => 'name',
   'empty_option' => true,
   'disabled' => '',
   'style' => ''
  );

  foreach($opts0 as $k => $v) {
   if (isset($opts[$k])) {
    $opts0[$k] = $opts[$k];
   }
  }

  return $H->selector($field_name,
		      $groups,
		      $id,
		      $opts0
  );
 }
}
