<?php

require_once('sangaku.inc');

class somas_agent {
 static $engl1_codes =
  array('MAS140','MAS151','MAS152','MAS153','MAS156','MAS161');

 static $engl1_codes_string = '';
 static $engl1_modules = array();
 static $engl1_moids = array();
 static $engl1_moids_string = '';
 
 function connect() {
  $db_pass = trim(file_get_contents('/var/sangaku/somas_cred.txt'));

  $this->db = mysqli_connect('maths.shef.ac.uk',
                             'moodle_agent',
                             $db_pass,
                             'pm6maths_somas',
                             3306);
  
  if (! $this->db) {
   trigger_error('Could not connect to database: ' . mysqli_connect_error());
   exit;
  }
 }

 function fetch_engl1_modules() {
  $w = array();
  foreach(somas_agent::$engl1_codes as $c) { $w[] = "'{$c}'"; }
  $w = implode(',',$w);

  somas_agent::$engl1_codes_string = $w;
  
  $q = <<<SQL
SELECT
 o.id AS somas_moid,
 o.module_code AS code, 
 m.title
FROM tbl_module_occurrences o 
 LEFT JOIN tbl_modules m ON o.module_code=m.code
WHERE o.session=2020
  AND o.module_code IN ($w)
ORDER BY o.module_code
SQL;

  $result = $this->db->query($q);

  if ($result === false) {
   $msg = "MySQL error: " . mysqli_error($this->db) . '<br/>' . 
        "Query: $q<br/>";
   trigger_error($msg);

   exit;
  }

  somas_agent::$engl1_modules = array();

  $w = array();
  
  while($x = mysqli_fetch_object($result)) {
   somas_agent::$engl1_modules[$x->somas_moid] = $x;
   somas_agent::$engl1_moids[] = $x->somas_moid;
   $w[] = "'{$x->somas_moid}'";
  }

  somas_agent::$engl1_moids_string = implode(',',$w);
 }
 
 function fetch_modules() {
  global $sangaku;

  $modules = $sangaku->load_where_indexed('modules','1','code');

  $q = <<<SQL
SELECT 
x.id AS somas_moid,
x.module_code AS code,
m.title AS title
FROM tbl_module_occurrences x
 LEFT JOIN tbl_modules m ON x.module_code=m.code
WHERE x.session=2020
 AND m.credit_level <= 2
SQL;

  $result = $this->db->query($q);

  if ($result === false) {
   $msg = "MySQL error: " . mysqli_error($this->db) . '<br/>' . 
        "Query: $q<br/>";
   trigger_error($msg);

   exit;
  }

  $changes = array();
  
  while($x = mysqli_fetch_object($result)) {
   $needs_update = false;
   if (isset($modules[$x->code])) {
    $m = $modules[$x->code];
   } else {
    $m = $sangaku->new_object('module');
    $m->code = $x->code;
    $needs_update = true;
   }

   foreach (array('somas_moid','title') as $k) {
    if ($m->$k != $x->$k) {
     $m->$k = $x->$k;
     $needs_update = true;
    }
   }

   if ($needs_update) {
    $m->save();
    $changes[] = $m;
   }
  }

  return $changes;
 }

 function fetch_groups() {
  global $sangaku;

  $modules = $sangaku->load_where_indexed('modules','1','somas_moid');
  foreach($modules as $m) {
   $m->load_tutorial_groups();
   $m->tgbsi = make_index($m->tutorial_groups,'somas_id');
  }
  
  $q = <<<SQL
SELECT 
 g.id AS somas_id,
 o.id AS moid,
 g.tutorial_group AS name,
 teacher_id,
 assistant_id,
 day_number,
 time_slot_id AS hour,
 week_parity 
FROM `tbl_teaching_events` g 
 LEFT JOIN tbl_module_occurrences o ON g.module_occurrence_id=o.id
  LEFT JOIN tbl_modules m ON o.module_code=m.code
WHERE o.session=2020
AND m.credit_level <= 2
AND g.type IN ('tutorial','lab session')
AND g.room_id=451
AND (o.semester = '1' OR (o.semester = 'Year' AND (g.semester = '1' OR g.semester = 'Year')))
ORDER BY m.code,g.tutorial_group
SQL;

  $result = $this->db->query($q);

  if ($result === false) {
   $msg = "MySQL error: " . mysqli_error($this->db) . '<br/>' . 
        "Query: $q<br/>";
   trigger_error($msg);

   exit;
  }

  $changes = array();
  
  while($x = mysqli_fetch_object($result)) {
   $needs_update = false;

   if (! isset($modules[$x->moid])) { continue; }
   $m = $modules[$x->moid];
   
   if (isset($m->tgbsi[$x->somas_id])) {
    $y = $m->tgbsi[$x->somas_id];
   } else {
    $y = $sangaku->new_object('tutorial_group');
    $y->somas_id = $x->somas_id;
    $needs_update = true;
   }

   $y->module_id = $m->id;
   
   foreach (array('name','day_number','hour','week_parity') as $k) {
    if ($y->$k != $x->$k) {
     $y->$k = $x->$k;
     $needs_update = true;
    }
   }

   if ($needs_update) {
    $y->save();
    $changes[] = $y;
   }
  }

  return $changes;
 }

 function fetch_engl1_groups() {
  global $sangaku;

  if (! somas_agent::$engl1_modules) {
   somas_agent::fetch_engl1_modules();
  }
  
  $engl1 = $sangaku->load_where('modules',"code='EngL1'")[0];
  $engl1->load_tutorial_groups();
  $engl1->tgbsi = make_index($engl1->tutorial_groups,'somas_id');

  $w = somas_agent::$engl1_codes_string;
  
  $q = <<<SQL
SELECT 
 g.id AS somas_id,
 o.module_code,
 g.tutorial_group,
 teacher_id,
 assistant_id,
 day_number,
 time_slot_id AS hour,
 week_parity 
FROM `tbl_teaching_events` g 
 LEFT JOIN tbl_module_occurrences o ON g.module_occurrence_id=o.id
  LEFT JOIN tbl_modules m ON o.module_code=m.code
WHERE o.session=2020
AND o.module_code IN ($w)
AND g.type IN ('tutorial','lab session')
AND g.room_id=451
AND (o.semester = '1' OR (o.semester = 'Year' AND (g.semester = '1' OR g.semester = 'Year')))
ORDER BY m.code,g.tutorial_group
SQL;

  $result = $this->db->query($q);

  if ($result === false) {
   $msg = "MySQL error: " . mysqli_error($this->db) . '<br/>' . 
        "Query: $q<br/>";
   trigger_error($msg);

   exit;
  }

  $changes = array();
  
  while($x = mysqli_fetch_object($result)) {
   $x->name = $x->module_code . substr($x->tutorial_group,1);
   $needs_update = false;

   if (isset($engl1->tgbsi[$x->somas_id])) {
    $y = $engl1->tgbsi[$x->somas_id];
   } else {
    $y = $sangaku->new_object('tutorial_group');
    $y->somas_id = $x->somas_id;
    $needs_update = true;
   }

   $y->module_id = $engl1->id;
   $needs_update = true;
   
   foreach (array('name','day_number','hour','week_parity') as $k) {
    if ($y->$k != $x->$k) {
     $y->$k = $x->$k;
     $needs_update = true;
    }
   }

   if ($needs_update) {
    $y->save();
    $changes[] = $y;
   }
  }

  return $changes;
 }

 function fetch_students() {
  global $sangaku;

  $students = $sangaku->load_where_indexed(
   'users',
   "x.status='student'",
   'username'
  );
  
  $modules_by_code = $sangaku->load_where_indexed('modules','1','code');

  $moids = array();
  
  foreach($modules_by_code as $m) {
   if ($m->somas_moid) {
    $moids[] = "{$m->somas_moid}";
   }
  }
  
  $moids = implode(',',$moids) . ',' .
         somas_agent::$engl1_moids_string;

  $q = <<<SQL
SELECT 
 s.id AS somas_student_id,
 s.user_name AS username, 
 s.gmail_name,
 s.surname,
 s.forename
 FROM tbl_students s 
WHERE EXISTS (
 SELECT * FROM `tbl_registrations` r 
 WHERE r.student_id=s.id AND r.module_occurrence_id IN ($moids)
)
SQL;

  $result = $this->db->query($q);

  if ($result === false) {
   $msg = "MySQL error: " . mysqli_error($this->db) . '<br/>' . 
        "Query: $q<br/>";
   trigger_error($msg);

   exit;
  }

  $changes = array();
  
  while($x = mysqli_fetch_object($result)) {
   if (strtolower($x->username) == 'no data' || ! $x->username) { continue; }
   
   $x->status = 'student';
   $needs_update = false;

   if (isset($students[$x->username])) {
    $y = $students[$x->username];
   } else {
    $y = $sangaku->new_object('user');
    $y->username = $x->username;
    $needs_update = true;
   }
   
   foreach (array('somas_student_id','gmail_name','surname','forename','status') as $k) {
    if ($y->$k != $x->$k) {
     $y->$k = $x->$k;
     $needs_update = true;
    }
   }

   if ($needs_update) {
    $y->save();
    $changes[] = $y;
   }
  }

  return $changes;
 }

 function fetch_registrations() {
  global $sangaku;

  $modules_by_code = $sangaku->load_where_indexed('modules','1','code');

  $students_by_id = $sangaku->load_where_indexed(
   'users',"x.status='student'",'id'
  );
  
  $students_by_somas_student_id =
   make_index($students_by_id,'somas_student_id');
  
  $registrations = $sangaku->load_all('registrations');

  foreach($students_by_id as $s) {
   $s->registrations_by_module_code = array();
  }

  foreach($registrations as $r) {
   if (isset($students_by_id[$r->student_id])) {
    $s = $students_by_id[$r->student_id];
    $s->registrations_by_module_code[$r->module_code] = $r;
    $r->is_confirmed = false;
   }
  }
   
  $moids = array();
  
  foreach($modules_by_code as $m) {
   if ($m->somas_moid) {
    $moids[] = "{$m->somas_moid}";
   }
  }
  
  $moids = implode(',',$moids) . ',' .
         somas_agent::$engl1_moids_string;
  
  $q = <<<SQL
SELECT 
 r.student_id AS somas_student_id,
 r.module_occurrence_id AS somas_moid,
 o.module_code
FROM tbl_registrations r
 LEFT JOIN tbl_module_occurrences o ON r.module_occurrence_id=o.id
WHERE r.module_occurrence_id IN ($moids)
SQL;

  $result = $this->db->query($q);

  if ($result === false) {
   $msg = "MySQL error: " . mysqli_error($this->db) . '<br/>' . 
        "Query: $q<br/>";
   trigger_error($msg);

   exit;
  }

  $changes = array();
  
  while($x = mysqli_fetch_object($result)) {
   if (in_array($x->somas_moid,somas_agent::$engl1_moids)) {
    $x->module_code='EngL1';
   }

   $x->module = $modules_by_code[$x->module_code];
   $x->module_id = $x->module->id;

   if (! isset($students_by_somas_student_id[$x->somas_student_id])) {
    continue;
   }
   
   $x->student = $students_by_somas_student_id[$x->somas_student_id];
   $x->student_id = $x->student->id;
   
   if (isset($x->student->registrations_by_module_code[$x->module_code])) {
    $y = $x->student->registrations_by_module_code[$x->module_code];
    $y->is_confirmed = true;
   } else {
    $y = $sangaku->new_object('registration');
    $y->module_id = $x->module->id;
    $y->student_id = $x->student->id;
    $y->save();
    $y->load();
    $y->action = 'insert';
    $changes[] = $y;
   }
  }

  foreach($students_by_id as $s) {
   foreach($s->registrations_by_module_code as $r) {
    if (! $r->is_confirmed) {
     $y->action = 'delete';
     $changes[] = $y;
     $y->load();
     $y->delete();
    }
   }
  }
  
  return $changes;
 }

 function fetch_group_students() {
  global $sangaku;

  $tutorial_groups =
   $sangaku->load_where_indexed('tutorial_groups','1','somas_id');

  $students =
   $sangaku->load_where_indexed('users',"x.status='student'",'somas_student_id');

  foreach($tutorial_groups as $g) {
   $g->load_students();
   $g->student_links_by_somas_student_id =
    make_index($g->student_links,'somas_student_id');
   foreach($g->student_links as $l) {
    $l->is_confirmed = false;
   }
  }
  
  $ids = array();

  foreach($tutorial_groups as $i => $x) {
   $ids[] = $i;
  }

  $ids = implode(',',$ids);

  $q = <<<SQL
SELECT 
 x.id,
 x.student_id AS somas_student_id,
 x.event_id AS somas_event_id
FROM tbl_tutorial_group_memberships x
WHERE x.event_id IN ($ids)
SQL;

  $result = $this->db->query($q);

  if ($result === false) {
   $msg = "MySQL error: " . mysqli_error($this->db) . '<br/>' . 
        "Query: $q<br/>";
   trigger_error($msg);

   exit;
  }

  $changes = array();
  
  while($x = mysqli_fetch_object($result)) {
   $g = $tutorial_groups[$x->somas_event_id];
   $x->tutorial_group = $g;
   $x->tutorial_group_id = $g->id;

   if (isset($g->student_links_by_somas_student_id[$x->somas_student_id])) {
    $l = $g->student_links_by_somas_student_id[$x->somas_student_id];
    $l->is_confirmed = true;
   } else {
    $l = $sangaku->new_object('tutorial_group_student');
    if (isset($students[$x->somas_student_id])) { 
     $s = $students[$x->somas_student_id];
     $l->student_id = $s->id;
     $l->tutorial_group_id = $g->id;
     $l->somas_membership_id = $x->id;
     $l->save();
     $l->load();
     $l->action = 'insert';
     $changes[] = $l;
    } else {
     $l->action = 'missing_student';
     $l->membership_id = $x->id;
     $l->somas_student_id = $x->somas_student_id;
     $l->somas_event_id = $x->somas_event_id;
     $l->module_code = $g->module_code;
     $l->tutorial_group_name = $g->name;
     $changes[] = $l;
    }
   }
  }

  foreach($tutorial_groups as $g) {
   foreach($g->student_links as $l) {
    if (! $l->is_confirmed) {
     $l->action = 'delete';
     $l->delete();
     $changes[] = $l;
    }
   }
  }

  return $changes;
 }
}


