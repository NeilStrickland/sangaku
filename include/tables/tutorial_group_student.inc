<?php

global $sangaku;

$sangaku->add_table(
 'tutorial_group_student','tutorial_group_students',
 array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'tutorial_group_id' => array('type' => 'integer','link' => 'tutorial_group'),
  'student_id' => array('type' => 'integer','link' => 'user')
 ),
 array(
  'tutorial_group_name' => array('type' => 'text'),
  'module_id' => array('type' => 'integer'),
  'module_code' => array('type' => 'text'),
  'somas_student_id' => array('type' => 'integer'),
  'somas_event_id' => array('type' => 'integer'),
  'username' => array('type' => 'text'), 
  'surname' => array('type' => 'text'), 
  'forename' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.tutorial_group_id,
 g.name AS tutorial_group_name,
 g.somas_id AS somas_event_id,
 g.semester,
 m.id AS module_id,
 m.code AS module_code,
 x.student_id,
 s.somas_student_id,
 s.username,
 s.surname,
 s.forename
FROM tbl_tutorial_group_students x
 LEFT JOIN tbl_users s ON x.student_id = s.id
  LEFT JOIN tbl_tutorial_groups g ON x.tutorial_group_id = g.id
   LEFT JOIN tbl_modules m ON g.module_id = m.id
WHERE %s
 ORDER BY m.code,g.name,s.surname,s.forename
 
SQL
);

class tutorial_group_student extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'tutorial_group_student',$id,$with_defaults);
 }

 function load_student() {
  global $sangaku;
  $this->student = $sangaku->load('user',$this->student_id);
  return $this->student;
 }
}
