<?php

global $sangaku;

$sangaku->add_table(
 'poll_item','poll_items',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'poll_id' => array('type' => 'integer','link' => 'poll'),
  'sequence_number' => array('type' => 'integer'),
  'code' => array('type' => 'text'),
  'text' => array('type' => 'text')
 ),
 array(
 ),
 <<<SQL
SELECT
 x.id,
 x.poll_id,
 x.sequence_number,
 x.code,
 x.text
FROM tbl_poll_items x
WHERE %s
 ORDER BY x.poll_id,x.sequence_number,x.id
 
SQL
);

class poll_item extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'poll_item',$id,$with_defaults);
 }

 function for_json() {
  $x = new stdClass();
  foreach(array('id','poll_id','sequence_number','code','text') as $k) {
   $x->$k = $this->$k;
  }
  return $x;
 }

 function to_json() {
  return json_encode($this->for_json());
 }
}
