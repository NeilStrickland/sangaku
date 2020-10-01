<?php

global $sangaku;

$sangaku->add_table(
 'status','statuses',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'code' => array('type' => 'text'),
  'icon' => array('type' => 'text'),
  'text' => array('type' => 'text'),
  'tutor_text' => array('type' => 'text'),
  'message' => array('type' => 'text'),
  'action' => array('type' => 'text')
 ),
 array(),
 <<<SQL
SELECT
 x.id,
 x.code,
 x.icon,
 x.text,
 x.tutor_text,
 x.message,
 x.action
FROM tbl_statuses x
WHERE %s
 ORDER BY x.id
 
SQL
);

class status extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'status',$id,$with_defaults);
 }

 function for_json() {
  $x = new stdClass();
  $x->id = $this->id;
  $x->code = $this->code;
  $x->icon = $this->icon;
  $x->text = $this->text;
  $x->tutor_text = $this->tutor_text;
  $x->message = $this->message;
  $x->action = $this->action;

  return $x;
 }

 function to_json() {
  return json_encode($this->for_json());
 }
}
