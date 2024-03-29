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

 function descriptor() {
  $d = '';
  if ($this->code) {
   if ($this->module_code) {
    $d = "{$this->module_code}:{$this->code}";
   } else {
    $d = $this->code;
   }
  } elseif ($this->id) {
   $d = "Problem sheet [{$this->id}]";
  } else {
   $d = "New problem sheet";
  }

  if (trim($this->title)) {
   $d = $d . ' (' . trim($this->title) . ')';
  }

  return $d;
 }

 function module_descriptor() {
  $d = '';
  if ($this->code) {
   $d = $this->code;
  } elseif ($this->id) {
   $d = "Problem sheet [{$this->id}]";
  } else {
   $d = "New problem sheet";
  }

  if (trim($this->title)) {
   $d = $d . ' (' . trim($this->title) . ')';
  }

  return $d;
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

 function load_sessions() {
  global $sangaku;
  
  $this->sessions = $sangaku->load_where('sessions',"x.problem_sheet_id={$this->id}");
  $this->sessions_by_group_id =
   make_index($this->sessions,'tutorial_group_id');

  $this->confirmed_sessions = array();
  $this->sessions_by_state = array();
  $this->confirmed_sessions_by_state = array();

  foreach(session::$time_states as $x) {
   $this->sessions_by_state[$x] = array();
   $this->confirmed_sessions_by_state[$x] = array();
  }

  foreach($this->sessions as $s) {
   $x = $s->get_time_state();
   $this->sessions_by_state[$x][] = $s;
   if ($s->is_confirmed) {
    $this->confirmed_sessions[] = $s;
    $this->confirmed_sessions_by_state[$x][] = $s;
   }
  }
  
  return $this->sessions;
 }

 function create_sessions($force = false) {
  global $sangaku;

  $this->load_question_items();
  if (! $this->question_items && ! $force) { return false; }
  if (! ($this->semester && $this->week_number)) { return false; }
  
  $module = $this->load_link('module');

  $this->which = '';
  if ($this->module_code == 'EngL1' || $this->module_code == 'MAS004') {
   if (strlen($this->code) >= 1 and substr($this->code,-1) == 'a') {
    $this->which = 'a';
   }
   if (strlen($this->code) >= 1 and substr($this->code,-1) == 'b') {
    $this->which = 'b';
   }
  }
  
  $groups = $module->load_tutorial_groups($this->semester);
  $this->load_sessions();

  foreach($groups as $g) {
   $create = $g->day_number && $g->hour && ! isset($this->sessions_by_group_id[$g->id]);

   $g->which = '';

   if (! isset($this->module_code)) { $this->dump(); exit; }
   
   if ($this->module_code == 'EngL1' || $this->module_code == 'MAS004') {
    $g->which = ($g->name == strtolower($g->name)) ? 'b' : 'a';

    if (! ($g->which && ($g->which == $this->which))) {
     $create = false;
    }
   }
   
   if ($create) {
    $s = $sangaku->new_object('session');
    $s->problem_sheet_id = $this->id;
    $s->tutorial_group_id = $g->id;
    $t = $sangaku->academic_timestamp(
     $this->semester,$this->week_number,$g->day_number,$g->hour
    );
    $s->date = date('Y-m-d',$t);
    $s->time = date('H:i:s',$t);
    $s->duration = 50;
    $s->save();
    $s->load();
    $this->sessions[] = $s;
    $this->sessions_by_group_id[$g->id] = $s;
   }
  }
  
  return true;
 }
 
 function preview() {
  global $sangaku;
  
  $H = $sangaku->html;
  $m = $this->load_link('module');
 
  $ss = $this->semester ? 'Semester ' . $this->semester : '';
  $ws = $this->week_number ? 'Week ' . $this->week_number : '';

  $html = '';
  
  $html .=  <<<HTML
<h1>{$this->title}<br/>
{$m->code} {$m->title} $ss $ws
</h1>

HTML
   ;

  if (trim($this->intro)) {
   $html .=  <<<HTML
<div class="sheet_intro">
{$this->intro}
</div>

HTML
    ;
  }

  $html .=  <<<HTML
<ul>

HTML
   ;

  foreach($this->question_items as $i) {
   if ($i->level > 1) { continue; }
   $html .=  "<li><span class=\"item_header\">{$i->titled_header()}: </span>";
   if (trim($i->problem)) {
    $html .=  "<span class=\"problem\">{$i->problem}</span><br/>";
    if (trim($i->solution)) {
     $html .=  "<div class=\"preview_solution\"><b>Solution:</b>{$i->solution}</div>";
    }
   }

   if ($i->children) {
    $html .=  "<ul>";
    foreach ($i->children as $j) {
     $html .=  "<li><span class=\"item_header\">{$j->titled_header()}: </span>";
     if (trim($j->problem)) {
      $html .=  "<span class=\"problem\">{$j->problem}</span><br/>";
      if (trim($j->solution)) {
       $html .=  "<div class=\"preview_solution\"><b>Solution:</b>{$j->solution}</div>";
      }
     }
    
     if ($j->children) {
      $html .=  "<ul>";
      foreach ($j->children as $k) {
       $html .=  "<li><span class=\"item_header\">{$k->titled_header()}: </span>";
       if (trim($k->problem)) {
        $html .=  "<span class=\"problem\">{$k->problem}</span><br/>";
       }

       if (trim($k->solution)) {
        $html .=  "<div class=\"preview_solution\"><b>Solution:</b>{$k->solution}</div>";
       }
       $html .=  "</li>";
      }
      $html .=  "</ul>";
     }
     $html .=  "</li>";
    }
    $html .=  "</ul>";
   }
   $html .=  "</li>";
  }
 
  $html .=  <<<HTML
</ul>

HTML
   ;

  return $html;
 }

 function for_json($with_solutions = false,$solutions_shown = array()) {
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
    $ws0 = in_array($q->id,$solutions_shown) || $ws;
    $x->question_items[] = $q->for_json($ws0);
   }
  }

  return ($x);
 }

 function to_json($with_solutions = false,$solutions_shown = array()) {
  return json_encode($this->for_json($with_solutions));
 }
}
