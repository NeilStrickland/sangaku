<?php

global $sangaku;

$sangaku->add_table(
 'poll_instance','poll_instances',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'poll_id' => array('type' => 'integer','link' => 'poll'),
  'session_id' => array('type' => 'integer','link' => 'session'),
  'state' => array('type' => 'text'),
  'start_timestamp' => array('type' => 'integer'),
  'end_timestamp' => array('type' => 'integer')  
 ),
 array(
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
 x.poll_id,
 x.session_id,
 x.state,
 x.start_timestamp,
 x.end_timestamp,
 s.tutorial_group_id,
 s.date AS session_date,
 s.time AS session_time,
 s.duration AS session_duration,
 g.name AS tutorial_group_name,
 g.semester AS tutorial_group_semester,
 g.day_number AS tutorial_group_day_number,
 g.hour AS tutorial_group_hour,
 g.week_parity AS tutorial_group_week_parity
FROM tbl_poll_instances x
 LEFT JOIN tbl_sessions s ON x.session_id=s.id
  LEFT JOIN tbl_tutorial_groups g ON s.tutorial_group_id=g.id
WHERE %s
 ORDER BY x.poll_id,g.day_number,g.hour,g.name,x.session_id,x.id 

SQL
);

class poll_instance extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'poll_instance',$id,$with_defaults);
 }

 function count_responses() {
  global $sangaku;
  
  $poll = $this->load_link('poll');
  $poll->load_items();
  foreach($poll->items as $item) {
   $item->count = 0;
  }

  $w = 'x.instance_id=' . $this->id;
  
  $responses = $sangaku->load_where('poll_responses',$w);

  foreach($responses as $r) {
   if ($poll->is_multiple) {
    $ii = json_decode($r->response_text);
    if (! is_array($ii)) {
     $ii = array((int) $ii);
    }
    foreach($ii as $i) {
     if (array_key_exists($i,$poll->items_by_id)) {
      $item = $poll->items_by_id[$i];
      $item->count++;
     }
    }
   } else {
    $i = (int) $r->response_text;
    if (array_key_exists($i,$poll->items_by_id)) {
     $item = $poll->items_by_id[$i];
     $item->count++;
    }
   }
  }

  $this->total_count = 0;
  foreach($poll->items as $item) {
   $this->total_count += $item->count;
  }
 }
 
 function start_timestamp() {
  if ($this->session_date && $this->session_time) {
   return strtotime($this->session_date . ' ' . $this->session_time);
  } else {
   return 0;
  }
 }
 
 function end_timestamp() {
  if ($this->session_date && $this->session_time && $this->session_duration) {
   return $this->start_timestamp() + 60 * $this->session_duration;
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
  if ($this->session_date && $this->session_time) {
   return date('H:i D, j/m',$this->start_timestamp());
  } else {
   return '';
  }
 }

 function for_json() {
  $x = new stdClass();

  foreach (array('id','poll_id','session_id','state','start_timestamp','end_timestamp') as $k) {
   $x->$k = $this->$k;

   if ($this->stage == 'count' || $this->stage == 'correct') {
    $x->total_count = isset($this->total_count) ? $this->total_count : 0;
   }
  }

  $poll = $this->load_link('poll');
  $poll->load_items();
  $x->poll = $poll->for_json($this->stage);
  
  return $x;
 }

 function to_json() {
  return json_encode($this->for_json());
 }
}
