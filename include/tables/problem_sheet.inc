<?php

global $sangaku;

$sangaku->add_table(
 'problem_sheet','problem_sheets',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'module_id' => array('type' => 'integer','link' => 'module'),
  'semester' => array('type' => 'integer'),
  'week_number' => array('type' => 'integer'),
  'code' => array('type' => 'text'),
  'title' => array('type' => 'text'),
  'intro' => array('type' => 'text'),
  'latex_source' => array('type' => 'text')
 ),
 array(
  'module_code' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.module_id,
 m.code AS module_code,
 x.semester,
 x.week_number,
 x.code,
 x.title,
 x.intro,
 x.latex_source
FROM tbl_problem_sheets x
 LEFT JOIN tbl_modules m ON x.module_id=m.id
WHERE %s
 ORDER BY x.id
 
SQL
);

class problem_sheet extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'problem_sheet',$id,$with_defaults);
 }

 function add_question_items($item0) {
  global $sangaku;
  $this->question_items[] = $item0;
  $children = $sangaku->load_where('question_items',"x.parent_id={$item0->id}");
  $item0->is_bottom = $children ? 0 : 1;
  foreach($children as $child) {
   $this->add_question_items($child);
  }
 }
 
 function load_question_items() {
  global $sangaku;

  $top_questions = 
   $sangaku->load_where('question_items',"x.problem_sheet_id={$this->id} AND x.level=1");
  
  $this->question_items = array();

  foreach($top_questions as $item0) {
   $this->add_question_items($item0);
  }

  $this->bottom_items = array();

  foreach($this->question_items as $i) {
   $i->children = array();
   if ($i->is_bottom) {
    $this->bottom_items[] = $i;
   }
  }

  $this->question_items_by_id = array();

  foreach($this->question_items as $i) {
   $this->question_items_by_id[$i->id] = $i;
  }

  $this->bottom_items_by_id = array();

  foreach($this->bottom_items as $i) {
   $this->bottom_items_by_id[$i->id] = $i;
  }

  foreach($this->question_items as $i) {
   if ($i->parent_id && isset($this->question_items_by_id[$i->parent_id])) {
    $i->parent = $this->question_items_by_id[$i->parent_id];
    $i->parent->children[] = $i;
   }
  }
  
  return($this->question_items);
 }

 function for_json($with_solutions = false) {
  $x = new stdClass();
  foreach (array('id','module_id','semester','week_number','code','title','intro') as $k) {
   $x->$k = $this->$k;
  }

  $ws = $with_solutions;
  if (isset($this->with_solutions) && $this->with_solutions) {
   $ws = true;
  }
  
  if (isset($this->question_items)) {
   $x->question_items = array();
   
   foreach($this->question_items as $q) {
    $x->question_items[] = $q->for_json($ws);
   }
  }

  return ($x);
 }

 function to_json($with_solutions = false) {
  return json_encode($this->for_json($with_solutions));
 }
}
