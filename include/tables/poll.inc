<?php

global $sangaku;

$sangaku->add_table(
 'poll','polls',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'module_id' => array('type' => 'integer','link' => 'module'),
  'problem_sheet_id' => array('type' => 'integer','link' => 'problem_sheet'),
  'session_id' => array('type' => 'integer','link' => 'session'),
  'code' => array('type' => 'text'),
  'title' => array('type' => 'text'),
  'intro' => array('type' => 'text'),
  'is_judgemental' => array('type' => 'boolean','default' => 0),
  'is_multiple' => array('type' => 'boolean','default' => 0)
 ),
 array(
  'module_code' => array('type' => 'text'),
  'module_title' => array('type' => 'text'),
  'problem_sheet_semester' => array('type' => 'integer'),
  'problem_sheet_week_number' => array('type' => 'integer'),
  'problem_sheet_code' => array('type' => 'text'),
  'problem_sheet_title' => array('type' => 'text'),
  'session_tutorial_group_id' => array('type' => 'integer','link' => 'tutorial_group'),
  'session_date' => array('type' => 'date'),
  'session_time' => array('type' => 'time'),
  'session_duration' => array('type' => 'integer','default' => 50,'notnull' => true),
  'tutorial_group_name' => array('type' => 'text'),
  'tutorial_group_semester' => array('type' => 'text'),
  'tutorial_group_day_number' => array('type' => 'integer'),
  'tutorial_group_hour' => array('type' => 'integer'),
  'tutorial_group_week_parity' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.module_id,
 m.code AS module_code,
 m.title AS module_title,
 x.problem_sheet_id,
 p.semester AS problem_sheet_semester,
 p.week_number AS problem_sheef_week_number,
 p.code AS problem_sheet_code,
 p.title AS problem_sheet_title,
 x.session_id,
 s.tutorial_group_id,
 s.date AS session_date,
 s.time AS session_time,
 s.duration AS session_duration,
 g.name AS tutorial_group_name,
 g.semester AS tutorial_group_semester,
 g.day_number AS tutorial_group_day_number,
 g.hour AS tutorial_group_hour,
 g.week_parity AS tutorial_group_week_parity,
 x.code,
 x.title,
 x.intro,
 x.is_judgemental,
 x.is_multiple
FROM tbl_polls x
 LEFT JOIN tbl_modules m ON x.module_id=m.id
  LEFT JOIN tbl_problem_sheets p ON x.problem_sheet_id=p.id
   LEFT JOIN tbl_sessions s ON x.session_id=s.id
    LEFT JOIN tbl_tutorial_groups g ON s.tutorial_group_id=g.id
WHERE %s
 ORDER BY m.code,p.week_number,s.date,s.time,x.code,x.id
 
SQL
);

class poll extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'poll',$id,$with_defaults);
 }

 function load_instances() {
  global $sangaku;
  
  $this->instances =
   $sangaku->load_where('poll_instances',"x.poll_id=" . ((int) $this->id));

  $this->instances_by_group_id =
   make_index($this->instances,'session_tutorial_group_id');

  $this->instances_by_session_id =
   make_index($this->instances,'session_id');
 }

 function load_items() {
  global $sangaku;
  
  $this->items =
   $sangaku->load_where('poll_items',"x.poll_id=" . ((int) $this->id));

  $i = 1;
  foreach($this->items as $x) {
   if ($x->sequence_number != $i) {
    $x->sequence_number = $i;
    $x->save();
   }
   $i++;
  }

  $this->items_by_id = make_index($this->items,'id');
 }

 function create_instances() {
  global $sangaku;
  
  $sheet = $this->load_link('problem_sheet');

  if (! $sheet) { return false; }
  if (! $this->id) { return false; }
  
  $this->load_instances();
  
  $sheet->load_sessions();
  foreach ($sheet->sessions as $s) {
   if (! array_key_exists($s->id,$this->instances_by_session_id)) {
    $inst = $sangaku->new_object('poll_instance');
    $inst->poll_id = $this->id;
    $inst->session_id = $s->id;
    $inst->state = 'before';
    $inst->save();
   }
  }

  $this->load_instances();
 }

 function preview() {
  global $sangaku;
  
  $H = $sangaku->html;

  $html = <<<HTML
  <div>
   <h1>{$this->title}</h1>
   <div class="poll_intro">
{$this->intro}    
   </div>
   <div class="poll_items">
    <table>
HTML
  ;

  foreach($this->items as $item) {
   if ($this->is_multiple) {
    $ip = '<input type="checkbox"/>';
   } else {
    $ip = '<input type="radio" name="fake"/>';
   }
   
   $html .= <<<HTML
     <tr class="poll_item">
      <td class="poll_item_box">$ip</td>
      <td class="poll_item_text">{$item->text}</td>
     </tr>
HTML
  ;
  }
  
  $html .= <<<HTML
    </table>
   </div>   
  </div>
  
HTML
  ;

  return $html;
 }

 function for_json($state = 'before') {
  $x = new stdClass();
  foreach (array('id','module_id','problem_sheet_id','session_id',
                 'title','intro','is_judgemental','is_multiple') as $k) {
   $x->$k = $this->$k;
  }

  $x->items = array();
  foreach ($this->items as $i) {
   $x->items[] = $i->for_json($state);
  }

  return $x;
 }

 function to_json($state = 'before') {
  return json_encode($this->for_json($state));
 }
}
