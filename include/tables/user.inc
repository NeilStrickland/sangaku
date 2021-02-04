<?php

global $sangaku;

$sangaku->add_table(
 'user','users',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'somas_student_id' => array('type' => 'integer'),
  'somas_person_id' => array('type' => 'integer'),
  'username' => array('type' => 'text'),
  'gmail_name' => array('type' => 'text'),
  'surname' => array('type' => 'text'),
  'forename' => array('type' => 'text'),
  'status' => array('type' => 'text')
 ),
 array(
  'full_name' => array('type' => 'text'),
  'backwards_name' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.somas_student_id,
 x.somas_person_id,
 x.username,
 x.gmail_name,
 x.surname,
 x.forename,
 CONCAT(x.forename,' ',x.surname) AS full_name,
 CONCAT(x.surname,', ',x.forename) AS backwards_name,
 x.status
FROM tbl_users x
WHERE %s
 ORDER BY x.surname, x.forename
 
SQL
);

class user extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'user',$id,$with_defaults);
 }

 function descriptor() {
  if ($this->surname && $this->username) {
   if ($this->username) {
    return "{$this->forename} {$this->surname} ({$this->username})";
   } else {
    return "{$this->forename} {$this->surname}";
   }
  } else {
   if ($this->username) {
    return $this->username;
   } else if ($this->id) {
    return "User {$this->id}";
   } else {
    return "New user";
   }
  }
 }

 function is_fake_student() {
  return ($this->status == 'student' &&
          strlen($this->username >= 4) &&
          substr($this->username,0,4) == 'fake');
 }
 
 function load_status($session) {
  global $sangaku;

  if (! isset($session->problem_sheet)) {
   $session->load_link('problem_sheet');
  }

  $problem_sheet = $session->problem_sheet;
  if (! isset($problem_sheet->question_items)) {
   $problem_sheet->load_question_items();
  }
  
  $w = "x.session_id={$session->id} AND x.student_id={$this->id}";
  
  $this->status_reports = $sangaku->load_where('status_reports',$w);
  $this->uploads = $sangaku->load_where('uploads',$w);
  $this->last_seen = 0;
  $this->last_response_time = 0;
  foreach($this->status_reports as $x) {
   $t = strtotime($x->timestamp);
   $this->last_seen = max($this->last_seen,$t);
  }
  foreach($this->uploads as $x) {
   $t = strtotime($x->timestamp);
   if ($x->teacher_id) {
    $this->last_response_time = max($this->last_response_time,$t);    
   } else {
    $this->last_seen = max($this->last_seen,$t);
   }
  }

  $this->item_status = array();
  $this->item_status_by_id = array();
  foreach($problem_sheet->question_items as $item) {
   $x = new student_item_status();
   $this->item_status_by_id[$item->id] = $x;
  }

  foreach($this->uploads as $x) {
   $this->item_status_by_id[$x->item_id]->append_upload($x);
  }

  foreach($this->status_reports as $x) {
   $this->item_status_by_id[$x->item_id]->append_status_report($x);
  }

  $this->needs_response = false;

  foreach($problem_sheet->question_items as $item) {
   $x = $this->item_status_by_id[$item->id];
   $x->needs_response = false;
   $y = $x->latest_report;
   
   if ($x->last_access_time > $x->last_response_time &&
       $y &&
       ($y->code == 'to_check' ||
        $y->code == 'stuck' ||
        $y->code == 'move')) {
    $x->needs_response = true;
    $this->needs_response = true;
   }   
  }
 }

 function load_registrations($force = false,$semester = '') {
  global $sangaku;

  if ($force || ! isset($this->registrations)) {
   $w = "x.student_id={$this->id}";
   if ($semester) {
    $w .= " AND (m.semester='$semester' OR m.semester='Year')";
   }
   
   $this->registrations =
    $sangaku->load_where('registrations',$w);

   $this->modules_by_code = array();
   $this->modules_by_id = array();
   foreach($this->registrations as $r) {
    $m = $r->load_link('module');
    $this->modules_by_code[$m->code] = $m;
    $this->modules_by_id[$m->id] = $m;
   }
  }
  
  return $this->modules_by_code;
 }

 function load_tutorial_groups($force = false,$semester = '') {
  global $sangaku;

  if ($force || ! isset($this->tutorial_groups)) {
   $w = "x.student_id={$this->id}";
   if ($semester) {
    $w .= " AND (g.semester='$semester' OR g.semester='Year' OR g.semester='' OR g.semester IS NULL)";
   }

   $this->tutorial_groups_links =
    $sangaku->load_where('tutorial_group_students',$w);

   $this->tutorial_groups = array();
   foreach($this->tutorial_groups_links as $l) {
    $this->tutorial_groups[] = $l->load_link('tutorial_group');
   }
  }
  
  return $this->tutorial_groups;
 }

 function load_student_sessions($semester='') {
  $this->load_registrations(true,$semester);

  $this->sessions = array();

  foreach($this->registrations as $r) {
   $r->load_sessions();
  }
 }

 function load_sessions($semester='') {
  $this->load_registrations(true,$semester);
  $this->load_tutorial_groups(true,$semester);
  
  $ss = array();
  foreach($this->tutorial_groups as $g) {
   $ss = array_merge($ss,$g->load_sessions());
  }

  $approved_ids = array();
  
  $this->sessions = $ss;
  $this->current_sessions = array();
  $this->future_sessions = array();
  $this->unlimited_sessions = array();
  $this->alternate_sessions = $ss;
  $this->current_alternate_sessions = array();
  $this->future_alternate_sessions = array();
  $this->unlimited_alternate_sessions = array();

  foreach($this->sessions as $s) {
   $approved_ids[$s->id] = 1;
   
   if ($s->is_current()) {
    $this->current_sessions[] = $s;
   }

   if ($s->is_future()) {
    $this->future_sessions[] = $s;
   }

   if ($s->is_unlimited()) {
    $this->unlimited_sessions[] = $s;
   }
  }

  $ss = array();
  foreach($this->modules_by_code as $m) {
   $ss = array_merge($ss,$m->load_sessions());
  }
  
  foreach($ss as $s) {
   if (isset($approved_ids[$s->id])) { continue; }

   $this->alternate_sessions[] = $s;
   
   if ($s->is_current()) {
    $this->current_alternate_sessions[] = $s;
   }

   if ($s->is_future()) {
    $this->future_alternate_sessions[] = $s;
   }

   if ($s->is_unlimited()) {
    $this->unlimited_alternate_sessions[] = $s;
   }
  }

  return $this->sessions;
 }

 function load_teacher_tutorial_groups($force = false,$semester='') {
  global $sangaku;

  if ($force || ! isset($this->teacher_tutorial_groups)) {
   $w = "x.teacher_id={$this->id}";
   if ($semester) {
    $w .= " AND (g.semester='$semester' OR g.semester='Year' OR g.semester='' OR g.semester IS NULL)";
   }

   $this->teacher_tutorial_groups_links =
    $sangaku->load_where('tutorial_group_teachers',$w);

   $this->teacher_tutorial_groups = array();
   foreach($this->teacher_tutorial_groups_links as $l) {
    $this->teacher_tutorial_groups[] = $l->load_link('tutorial_group');
   }
  }
  
  return $this->teacher_tutorial_groups;
 }

 function load_teacher_sessions($semester='') {
  $this->load_teacher_tutorial_groups(true,$semester);
  $ss = array();
  foreach($this->teacher_tutorial_groups as $g) {
   $ss = array_merge($ss,$g->load_sessions());
  }

  $this->teacher_sessions = $ss;

  $this->current_teacher_sessions = array();
  $this->future_teacher_sessions = array();
  $this->unlimited_teacher_sessions = array();

  foreach($this->teacher_sessions as $s) {
   if ($s->is_current()) {
    $this->current_teacher_sessions[] = $s;
   }

   if ($s->is_future()) {
    $this->future_teacher_sessions[] = $s;
   }

   if ($s->is_unlimited()) {
    $this->unlimited_teacher_sessions[] = $s;
   }
  }
 }

 function for_json() {
  $x = new stdClass();
  $x->id = $this->id;
  $x->username = $this->username;
  $x->surname = $this->surname;
  $x->forename = $this->forename;
  
  if (isset($this->status_reports)) {
   $x->status_reports = array();

   foreach ($this->status_reports as $r) {
    $x->status_reports[] = $r->for_json();
   }
  }

  if (isset($this->uploads)) {
   $x->uploads = array();

   foreach ($this->uploads as $u) {
    $x->uploads[] = $u->for_json();
   }
  }

  return $x;
 }

 function to_json() {
  return json_encode($this->for_json());
 }

 function for_session_json() {
  $x = new stdClass();
  $x->id = $this->id;
  $x->username = $this->username;
  $x->surname = $this->surname;
  $x->forename = $this->forename;

  if (isset($this->item_status_by_id)) {
   $x->item_status_by_id = array();
   
   foreach ($this->item_status_by_id as $i => $r) {
    $x->item_status_by_id[$i] =
     $r->for_session_json();
   }
  }

  return $x;
 }

 function to_session_json() {
  return json_encode($this->for_session_json());
 }
}


class student_item_status {
 function __construct() {
  $this->status_reports = array();
  $this->uploads = array();
  $this->has_uploads = false;
  $this->last_status_time = 0;
  $this->last_upload_time = 0;
  $this->last_access_time = 0;
  $this->last_response_time = 0;
  $this->latest_report = null;
  $this->needs_response = false;
 }

 function append_status_report($x) {
  $t = strtotime($x->timestamp);
  $this->status_reports[] = $x;
  $this->latest_report = $x;
  $this->last_status_time = max($this->last_status_time,$t);
  $this->last_access_time = max($this->last_access_time,$t);
 }

 function append_upload($x) {
  $t = strtotime($x->timestamp);

  $this->uploads[] = $x;
  $this->has_uploads = true;

  if ($x->teacher_id) {
    $this->last_response_time = max($this->last_response_time,$t);
  } else {
   $this->last_upload_time = max($this->last_upload_time,$t);
   $this->last_access_time = max($this->last_access_time,$t);
  }
 }

 function for_json() {
  $x = new stdClass();
  $x->status_reports = array();
  $x->uploads = array();
  $x->has_uploads = $this->has_uploads;
  $x->last_status_time = $this->last_status_time;
  $x->last_upload_time = $this->last_upload_time;
  $x->last_access_time = $this->last_access_time;
  $x->last_response_time = $this->last_response_time;
  $x->latest_report = $this->latest_report->for_json();
  $x->needs_response = $this->needs_response;

  foreach ($this->status_reports as $y) {
   $x->status_reports[] = $y->for_json();
  }

  foreach ($this->uploads as $y) {
   $x->uploads[] = $y->for_json();
  }

  return $x;
 }

 function to_json() {
  return json_encode($this->for_json());
 }

 function for_session_json() {
  $x = new stdClass();
  $x->has_uploads = $this->has_uploads;
  $x->last_status_time = $this->last_status_time;
  $x->last_upload_time = $this->last_upload_time;
  $x->last_access_time = $this->last_access_time;
  $x->last_response_time = $this->last_response_time;
  if ($this->latest_report) {
   $x->latest_report = $this->latest_report->for_json();
  } else {
   $x->latest_report = null;
  }
  $x->needs_response = $this->needs_response;

  return $x;
 }

 function to_session_json() {
  return json_encode($this->for_session_json());
 }
}
