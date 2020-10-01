<?php

global $sangaku;

$sangaku->add_table(
 'module','modules',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'somas_moid' => array('type' => 'integer'),
  'code' => array('type' => 'text'),
  'title' => array('type' => 'text')
 ),
 array(
 ),
 <<<SQL
SELECT
 x.id,
 x.somas_moid,
 x.code,
 x.title
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

 function load_tutorial_groups($force = false) {
  global $sangaku;

  if ($force || ! isset($this->tutorial_groups)) {
   $this->tutorial_groups =
    $sangaku->load_where_indexed('tutorial_groups',
                                 "x.module_id={$this->id}");
  }

  return $this->tutorial_groups;
 }

 function load_problem_sheets($force = false) {
  global $sangaku;

  if ($force || ! isset($this->problem_sheets)) {
   $this->problem_sheets =
    $sangaku->load_where_indexed('problem_sheets',
                                 "x.module_id={$this->id}");
  }

  return $this->problem_sheets;
 }

 function load_sessions($force = false) {
  global $sangaku;
  
  if ($force || ! isset($this->sessions)) {
   $this->sessions = array();

   $this->load_tutorial_groups();
   $this->load_problem_sheets();

   foreach($this->tutorial_groups as $x) { $x->sessions = array(); }
   foreach($this->problem_sheets  as $x) { $x->sessions = array(); }

   $this->sessions =
     $sangaku->load_where('sessions',"g.module_id={$this->id}");

   foreach($this->sessions as $s) {
    if (isset($this->tutorial_groups[$s->tutorial_group_id])) {
     $g = $this->tutorial_groups[$s->tutorial_group_id];
     $g->sessions[] = $s;
    }
    if (isset($this->problem_sheets[$s->problem_sheet_id])) {
     $p = $this->problem_sheets[$s->problem_sheet_id];
     $p->sessions[] = $s;
    }
   }
  }

  return $this->sessions;
 }
}
