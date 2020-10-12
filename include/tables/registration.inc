<?php

global $sangaku;

$sangaku->add_table(
 'registration','registrations',
 array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'student_id' => array('type' => 'integer','link' => 'user'),
  'module_id' => array('type' => 'integer','link' => 'module')
 ),
 array(
  'module_code' => array('type' => 'text'),
  'module_title' => array('type' => 'text'),
  'somas_moid' => array('type' => 'integer'),
  'username' => array('type' => 'text'), 
  'gmail_name' => array('type' => 'text'), 
  'surname' => array('type' => 'text'), 
  'forename' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.student_id,
 x.module_id,
 m.code AS module_code,
 m.title AS module_title,
 m.somas_moid,
 x.student_id,
 s.username,
 s.gmail_name,
 s.surname,
 s.forename
FROM tbl_registrations x
 LEFT JOIN tbl_users s ON x.student_id = s.id
  LEFT JOIN tbl_modules m ON x.module_id = m.id
WHERE %s
 ORDER BY m.code,s.surname,s.forename
 
SQL
);

class registration extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'registration',$id,$with_defaults);
 }

 function load_student() {
  global $sangaku;
  $this->student = $sangaku->load('user',$this->student_id);
  return $this->student;
 }
}
