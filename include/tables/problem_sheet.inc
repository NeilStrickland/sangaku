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
  'module_code' => array('type' => ''text)
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

 function load_question_items() {
  global $sangaku;

  $this->question_items =
   $sangaku->load_where('question_items',"x.problem_sheet_id={$this->id}");

  $this->bottom_items = array();

  foreach($this->question_items as $i) {
   $i->children = array();
   if ($i->is_bottom) {
    $this->bottom_items[] = $i;
   }
  }

  $this->question_items_by_id = array();
  $this->question_items_by_full_header = array();

  foreach($this->question_items as $i) {
   $this->question_items_by_id[$i->id] = $i;
   $this->question_items_by_full_header[$i->full_header] = $i;
  }

  $this->bottom_items_by_id = array();
  $this->bottom_items_by_full_header = array();

  foreach($this->bottom_items as $i) {
   $this->bottom_items_by_id[$i->id] = $i;
   $this->bottom_items_by_full_header[$i->full_header] = $i;
  }

  foreach($this->question_items as $i) {
   if ($i->parent_id && isset($this->question_items_by_id[$i->parent_id])) {
    $i->parent = $this->question_items_by_id[$i->parent_id];
    $i->parent->children[] = $i;
   }
  }
  
  return($this->question_items);
 }

 function parse_question_items() {
  global $sangaku;
  
  $doc = new DOMDocument();
  $doc->loadHTML($this->question_text);
  $xpath = new DOMXpath($doc);

  $t = new stdClass();
  $t->question_items = array();
  $t->bottom_items = array();
  $t->questions = array();
  
  $questions_ = $xpath->query(".//div[@class='question']");
  foreach($questions_ as $question_) {
   $question = new stdClass();
   $question->level = 1;
   $question->question_index = count($t->questions);
   $question->item_index = count($t->question_items);
   $t->questions[] = $question;
   $t->question_items[] = $question;
   $question->parent = null;
   $question->div = $question_;
   $this->get_header($xpath,$question);
   $question->parts = array();

   $parts_ = $xpath->query(".//div[@class='part']",$question_);
   foreach($parts_ as $part_) {
    $part = new stdClass();
    $part->level = 2;
    $part->part_index = count($question->parts);
    $part->item_index = count($t->question_items);
    $question->parts[] = $part;
    $t->question_items[] = $part;
    $part->parent = $question;
    $part->div = $part_;
    $this->get_header($xpath,$part);
    $part->subparts = array();

    $subparts_ = $xpath->query(".//div[@class='subpart']",$part_);
    foreach($subparts_ as $subpart_) {
     $subpart = new stdClass();
     $subpart->level = 3;
     $subpart->subpart_index = count($part->subparts);
     $subpart->item_index = count($t->question_items);
     $part->subparts[] = $subpart;
     $t->question_items[] = $subpart;
     $subpart->parent = $part;
     $subpart->div = $subpart_;
     $this->get_header($xpath,$subpart);

     $subpart->is_bottom = true;
     $subpart->bottom_index = count($t->bottom_items);
    }

    $part->is_bottom = ! $part->subparts;
    if ($part->is_bottom) {
     $part->bottom_index = count($t->bottom_items);
     $t->bottom_items[] = $part;
    }
   }

   $question->is_bottom = ! $question->parts;
   if ($question->is_bottom) {
    $question->bottom_index = count($t->bottom_items);
    $t->bottom_items[] = $question;
   }
  }

  $t->question_items_by_full_header = array();
  foreach($t->question_items as $i) {
   $t->question_items_by_full_header[$i->full_header] = $i;
  }
  
  $this->tree = $t;

  $this->load_question_items();
  $u = $t->question_items_by_full_header;
  $v = $this->question_items_by_full_header;
  
  foreach($u as $h => $i) {
   $i->problem_sheet_id = $this->id;
   $i->id = null;
   if (array_key_exists($h,$v)) {
    $i->id = $v[$h]->id;
   } else {
    $x = $sangaku->new_object('question_item');
    $x->problem_sheet_id = $this->id;
    $x->titled_header = $i->titled_header;
    $x->header = $i->header;
    $x->full_header = $i->full_header;
    $x->level = $i->level;
    if ($i->parent) {
     $x->parent_id = $i->parent->id;
    }
    $x->is_bottom = $i->is_bottom;
    $x->save();
    $x->load();
    $v[$x->full_header] = $x;
   }
  }

  foreach($v as $h => $x) {
   if (! array_key_exists($h,$u)) {
    $x->delete();
   }
  }

  return ($this->tree);
 }

 function get_header($xpath,$i) {
  global $sangaku;
  
  $l = $i->level + 1;
  $x = $xpath->query('.//h' . $l,$i->div);
  if ($x) {
   $s = $x[0]->nodeValue;
   $i->titled_header = $s;
   $k = strpos($s,':');
   if ($k === false) {
    $i->header = $s;
   } else {
    $i->header = substr($s,0,$k);
   }

   if (isset($i->parent_id) && $i->parent_id && ! $i->parent) {
    $i->parent = $sangaku->load('question_item',$i->parent_id);
   }
   
   if ($i->parent) {
    $i->full_header = $i->parent->full_header . $i->header;
   } else {
    $i->full_header = $i->header;
   }
  } else {
   $i->titled_header = '';
   $i->full_header = '';
  }
 }

 function for_json($with_solutions = false) {
  $x = new stdClass();
  $x->id = $this->id;
  $x->module_id = $this->module_id;
  $x->title = $this->title;
  $x->intro = $this->intro;
  
  if (isset($this->question_items)) {
   $x->question_items = array();
   
   foreach($this->question_items as $q) {
    $x->question_items[] = $q->for_json($with_solutions);
   }
  }

  return ($x);
 }

 function to_json($with_solutions = false) {
  return json_encode($this->for_json($with_solutions));
 }
}
