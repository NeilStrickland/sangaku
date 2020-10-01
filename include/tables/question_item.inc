<?php

global $sangaku;

$sangaku->add_table(
 'question_item','question_items',
 array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'problem_sheet_id' => array('type' => 'integer','link' => 'problem_sheet'),
  'parent_id' => array('type' => 'integer','link' => 'question_item'),
  'titled_header' => array('type' => 'text'),
  'header' => array('type' => 'text'),
  'full_header' => array('type' => 'text'),
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
 x.titled_header,
 x.header,
 x.full_header,
 x.level,
 x.is_bottom,
 x.problem,
 x.solution
FROM tbl_question_items x
WHERE %s
 ORDER BY x.problem_sheet_id,x.full_header
 
SQL
);

class question_item extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'question_item',$id,$with_defaults);
 }

 function for_json($with_solution = false) {
  $x = new stdClass();
  $x->id = $this->id;
  $x->problem_sheet_id = $this->problem_sheet_id;
  $x->parent_id = $this->parent_id;
  $x->titled_header = $this->titled_header;
  $x->header = $this->header;
  $x->full_header = $this->full_header;
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
