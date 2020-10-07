<?php

global $sangaku;

$sangaku->add_table(
 'status_report','status_reports',
 array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'session_id' => array('type' => 'integer','link' => 'session'),
  'item_id' => array('type' => 'integer','link' => 'question_item'),
  'student_id' => array('type' => 'integer','link' => 'user'),
  'status_id' => array('type' => 'integer','link' => 'status'),
  'timestamp' => array('type' => 'string')
 ),
 array(
  'student_username' => array('type' => 'text'),
  'code' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.session_id,
 x.item_id,
 x.student_id,
 x.status_id,
 s.code,
 p.username AS student_username,
 x.timestamp
FROM tbl_status_reports x
 LEFT JOIN tbl_statuses s ON x.status_id = s.id
  LEFT JOIN tbl_users p ON x.student_id = p.id
WHERE %s
 ORDER BY x.item_id,x.timestamp
 
SQL
);

class status_report extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'status_report',$id,$with_defaults);
 }

 function for_json() {
  $x = new stdClass();
  $x->id         = $this->id;
  $x->session_id = $this->session_id;
  $x->item_id    = $this->item_id;
  $x->student_id = $this->student_id;
  $x->status_id  = $this->status_id;
  $x->timestamp  = $this->timestamp;

  return $x;
 }

 function to_json() {
  return json_encode($this->for_json());
 }
}
