<?php

global $sangaku;

$sangaku->add_table(
 'poll_response','poll_responses',
  array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'poll_id' => array('type' => 'integer','link' => 'poll'),
  'user_id' => array('type' => 'integer','link' => 'user'),
  'poll_item_id' => array('type' => 'integer','link' => 'poll_item'),
  'response_timestamp' => array('type' => 'integer')
 ),
 array(
 ),
 <<<SQL
SELECT
 x.id,
 x.poll_id,
 x.user_id,
 x.poll_item_id,
 x.response_timestamp
FROM tbl_poll_responses x
WHERE %s
 ORDER BY x.poll_id,x.poll_item_id,x.user_id,x.response_timestamp,x.id
 
SQL
);

class poll_response extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'poll_response',$id,$with_defaults);
 }
}
