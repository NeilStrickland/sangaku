<?php

global $sangaku;

$sangaku->add_table(
 'session','sessions',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'problem_sheet_id' => array('type' => 'integer','link' => 'problem_sheet'),
  'tutorial_group_id' => array('type' => 'integer','link' => 'tutorial_group'),
  'date' => array('type' => 'date'),
  'time' => array('type' => 'time'),
  'duration' => array('type' => 'integer','default' => 50,'notnull' => true),
  'is_confirmed' => array('type' => 'boolean','default' => 0,'notnull' => true),
  'solutions_shown' => array('type' => 'text'),
  'video_url' => array('type' => 'text'),
  'is_online' => array('type' => 'boolean')
 ),
 array(
  'problem_sheet_title' => array('type' => 'text'),
  'tutorial_group_name' => array('type' => 'text'),
  'semester' => array('type' => 'text'),
  'module_code' => array('type' => 'text'),
  'module_video_url' => array('type' => 'text'),
  'video_url_description' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.problem_sheet_id,
 p.title AS problem_sheet_title,
 x.tutorial_group_id,
 g.name AS tutorial_group_name,
 g.semester,
 m.code AS module_code,
 m.title AS module_title, 
 x.date,
 x.time,
 x.duration,
 x.is_confirmed,
 x.solutions_shown,
 x.video_url,
 m.video_url AS module_video_url,
 m.video_url_description
FROM tbl_sessions x
 LEFT JOIN tbl_problem_sheets p ON x.problem_sheet_id = p.id 
  LEFT JOIN tbl_tutorial_groups g ON x.tutorial_group_id = g.id
   LEFT JOIN tbl_modules m ON p.module_id = m.id
WHERE %s
 ORDER BY x.date,x.time,m.code,g.name
 
SQL
);

class session extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'session',$id,$with_defaults);
 }

 function start_timestamp() {
  if ($this->date && $this->time) {
   return strtotime($this->date . ' ' . $this->time);
  } else {
   return 0;
  }
 }
 
 function end_timestamp() {
  if ($this->date && $this->time && $this->duration) {
   return $this->start_timestamp() + 60 * $this->duration;
  } else {
   return 0;
  }
 }

 function start_time() {
   $t = $this->start_timestamp();
   if ($t) {
    return date('Y-m-d H:i:s',$t);
   } else {
    return null;
   }
  }
 
  function end_time() {
  $t = $this->end_timestamp();
  if ($t) {
   return date('Y-m-d H:i:s',$t);
  } else {
   return null;
  }
 }

 function friendly_start_time() {
  if ($this->date && $this->time) {
   return date('H:i D, j/m',$this->start_timestamp());
  } else {
   return '';
  }
 }

 static $time_states = array('unscheduled','future','imminent','running','finished');
 
 function get_time_state() {
  global $sangaku;
  
  $t0 = $this->start_timestamp();
  $t1 = $this->end_timestamp();

  $t = $sangaku->time();
  
  if (! $t0) {
   $s = 'unscheduled';
  } else if ($t < $t0 - 600) {
   $s = 'future';
  } else if ($t < $t0) {
   $s = 'imminent';
  } else if ($t < $t1) {
   $s = 'running';
  } else {
   $s = 'finished';
  }

  $this->time_state = $s;
  return $s;
 }
 
 function is_current($leeway = 600) {
  global $sangaku;
  
  $t0 = $this->start_timestamp();
  $t1 = $this->end_timestamp();
  $t = $sangaku->time();

  if ($t0 && $t1 && ($t0 - $leeway <= $t) && ($t <= $t1 + $leeway)) {
   return true;
  } else {
   return false;
  }
 }

 function is_future($leeway = 600) {
  global $sangaku;
  
  $t1 = $this->end_timestamp();
  $t = $sangaku->time();

  if ($t1 && ($t <= $t1 + $leeway)) {
   return true;
  } else {
   return false;
  }
 }

 function is_unlimited() {
  return ($this->date == '' && $this->time == '');
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

 function effective_video_url() {
  if ($this->is_online) {
   if ($this->video_url) {
    return $this->video_url;
   } else {
    return $this->module_video_url;
   }
  } else {
   return null;
  }
 }

 function load_snapshots() {
  global $sangaku;
  
  $this->snapshots = $sangaku->load_where('snapshots',"x.session_id={$this->id}");
  $this->snapshots_by_id = make_index($this->snapshots,'id');
 }
 
 function load_poll_instances() {
  global $sangaku;
  
  $w = "x.session_id={$this->id}";

  if ($this->problem_sheet_id) {
   $w .= " OR p.problem_sheet_id={$this->problem_sheet_id}";
  }

  $this->poll_instances = $sangaku->load_where('poll_instances',$w);

  foreach($this->poll_instances as $inst) {
   $poll = $inst->load_link('poll');
   $poll->load_items();
  }
 }

 function load_associated() {
  global $sangaku;
  
  $p = $this->load_link('problem_sheet');
  $g = $this->load_link('tutorial_group');
  $p->load_question_items();
  $g->load_students();
  $g->load_teachers();

  $this->students = make_index($g->students,'id');

  $q = <<<SQL
SELECT DISTINCT y.id FROM ((
 SELECT x.student_id AS id
 FROM tbl_tutorial_group_students x 
 WHERE x.tutorial_group_id={$g->id}
) UNION (
 SELECT x.student_id AS id
 FROM tbl_status_reports x 
 WHERE x.session_id={$this->id}
) UNION (
 SELECT x.student_id AS id
 FROM tbl_uploads x 
 WHERE x.session_id={$this->id}
) ) y

SQL
     ;

  $ss = $sangaku->get_all($q);
  foreach($ss as $s0) {
   if (! isset($this->students[$s0->id])) {
    $s = $sangaku->load('user',$s0->id);
    $this->students[$s->id] = $s;
   }
  }
  
  foreach($this->students as $s) {
   $s->load_status($this);
  }

  $this->load_snapshots();
  $this->load_poll_instances();
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

 function student_button($student_id,$approved = false) {
  $s = $this->get_time_state();
  $d = $this->friendly_start_time();
  $g = 'Group ' . $this->tutorial_group_name;
  $u = '/sangaku/problem_sheet.php?session_id=' . $this->id .
     '&student_id=' . $student_id;
  $a = $approved ? ' approved' : '';
  
  if ($s == 'unscheduled') {
   return <<<HTML
<button type="button" class="unscheduled session{$a}">$g : unscheduled</button>

HTML
    ;
  } else if ($s == 'future') {
   return <<<HTML
<button type="button" class="future session{$a}">$g : $d</button>

HTML
    ;
  } else if ($s == 'imminent') {
   return <<<HTML
<button type="button" class="imminent session{$a}" onclick="location='$u'">$g : On soon</button>

HTML
    ;
  } else if ($s == 'running') {
   return <<<HTML
<button type="button" class="running session{$a}" onclick="location='$u'">$g : On now</button>

HTML
    ;
  } else if ($s == 'finished') {
   return <<<HTML
<button type="button" class="finished session{$a}">$g : finished</button>

HTML
    ;
  } else {
   return '';
  }
 }
 
 function for_json($with_solutions = false) {
  $x = new stdClass();
  $x->id = $this->id;
  $x->problem_sheet_id = $this->problem_sheet_id;
  $x->tutorial_group_id = $this->tutorial_group_id;
  $x->start_timestamp = $this->start_timestamp();
  $x->end_timestamp   = $this->end_timestamp();
  $x->duration        = $this->duration;
  $x->is_confirmed    = $this->is_confirmed;
  $sols = $this->solutions_shown;
  if (! $sols) { $sols = '[]'; }
  $sols_array = json_decode($sols);
  $x->solutions_shown = $sols;

  if (isset($this->problem_sheet)) {
   $x->problem_sheet = $this->problem_sheet->for_json($with_solutions,$sols_array);
  }

  if (isset($this->tutorial_group)) {
   $x->tutorial_group = $this->tutorial_group->for_session_json();
   $x->tutorial_group->students = array();
  }

  if (isset($this->students)) {
   $x->students = array();

   foreach($this->students as $s) {
    $x->students[] = $s->for_session_json();
   }
  }

  $x->has_snapshots = isset($this->snapshots) && $this->snapshots;

  return ($x);
 }

 function to_json($with_solutions = false) {
  return json_encode($this->for_json($with_solutions));
 }
}


// end
