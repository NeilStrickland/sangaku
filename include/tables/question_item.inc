<?php

global $sangaku;

$sangaku->add_table(
 'question_item','question_items',
 array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'problem_sheet_id' => array('type' => 'integer','link' => 'problem_sheet'),
  'parent_id' => array('type' => 'integer','link' => 'question_item'),
  'position' => array('type' => 'integer'),
  'header' => array('type' => 'text'),
  'title' => array('type' => 'text'),
  'level' => array('type' => 'integer'),
  'is_bottom' => array('type' => 'boolean'),
  'problem' => array('type' => 'text'),
  'solution' => array('type' => 'text')
 ),
 array(),
 <<<SQL
SELECT
 x.id,
 x.problem_sheet_id,
 x.parent_id,
 x.position,
 x.header,
 x.title,
 x.level,
 x.is_bottom,
 x.problem,
 x.solution
FROM tbl_question_items x
WHERE %s
 ORDER BY x.problem_sheet_id,x.id
 
SQL
);

class question_item extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'question_item',$id,$with_defaults);
 }

 function auto_header() {
  if ($this->header) { return $this->header; }
  if ($this->level == 1 && $this->position) { return 'Q' . $this->position; }

  if ($this->level == 2 && $this->position >= 1 && $this->position <= 26) {
   return '(' . chr($this->position + 96) . ')';
  }

  if ($this->level == 3 && $this->position >= 1 && $this->position <= 12) {
   return array('(i)','(ii)','(iii)','(iv)','(v)','(vi)','(vii)','(viii)','(xi)','(x)','(xi)','(xii)')[$this->position];
  }

  return '';
  //  return '[' . $this->position . ',' . $this->level . ']';
 }
 
 function titled_header() {
  if ($this->title) {
   return $this->auto_header() . ': ' . $this->title;
  } else {
   return $this->auto_header();
  }
 }

 function full_header() {
  if ($this->parent_id && ! $this->parent) {
   $this->load_link('parent');
  }

  if ($this->parent) {
   return $this->parent->full_header() . $this->auto_header();
  } else {
   return $this->auto_header();
  }
 }
 
 function for_json($with_solution = false) {
  $x = new stdClass();
  $x->id = $this->id;
  $x->problem_sheet_id = $this->problem_sheet_id;
  $x->parent_id = $this->parent_id;
  $x->position = $this->position;
  $x->title = $this->title;
  $x->header = $this->header;
  $x->level = $this->level;
  $x->is_bottom = $this->is_bottom;
  $x->problem = $this->problem;
  if ($with_solution) {
   $x->solution = $this->solution;
  }
  return $x;
 }
 
 function to_json($with_solution = false) {
  return json_encode($this->for_json($with_solution));
 }
}
