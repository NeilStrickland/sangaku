<?php

global $sangaku;

$sangaku->add_table(
 'poll_response','poll_responses',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'instance_id' => array('type' => 'integer','link' => 'poll_instance'),
  'user_id' => array('type' => 'integer','link' => 'user'),
  'response_text' => array('type' => 'text'),
  'response_timestamp' => array('type' => 'integer')
 ),
 array(
 ),
 <<<SQL
SELECT
 x.id,
 x.instance_id,
 i.poll_id,
 x.user_id,
 x.response_text,
 x.response_timestamp
FROM tbl_poll_responses x
 LEFT JOIN tbl_poll_instances i ON x.instance_id = i.id
WHERE %s
 ORDER BY i.poll_id,x.user_id,x.response_timestamp,x.id
 
SQL
);

class poll_response extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'poll_response',$id,$with_defaults);
 }

 function load_poll($force = 0) {
  if ($force || ! isset($this->instance)) {
   $this->load_link('instance');
  }

  if ($force || ! isset($this->instance->poll)) {
   $this->poll = $this->instance->load_link('poll');
  }
 }

 function parse_response() {
  $this->load_poll();
  $this->poll->load_items();
  
  if ($this->poll->is_multiple) {
   $this->response = array();
   $rr = json_decode($this->response_text);

   if (is_array($rr)) {
    foreach($rr as $r) {
     $i = (int) $r;
     if ($i && array_key_exists($i,$this->poll->items_by_id)) {
      $this->response[] = $i;
     }
    }
   }
  } else {
   $this->response = null;
   $i = (int) $this->response_text;
   if ($i && array_key_exists($i,$this->poll->items_by_id)) {
    $this->response = $i;
   }
  }

  return $this->response;
 }

 function set_response_text($r) {
  $this->response_text = $r;
  $this->parse_response();
  if ($this->response) {
   $this->response_text = json_encode($this->response);
  } else {
   $this->response_text = '';
  }
 }
}
