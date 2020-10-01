<?php

global $sangaku;

$sangaku->add_table(
 'tutorial_group_teacher','tutorial_group_teachers',
 array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'tutorial_group_id' => array('type' => 'integer','link' => 'tutorial_group'),
  'teacher_id' => array('type' => 'integer','link' => 'user')
 ),
 array(
  'tutorial_group_name' => array('type' => 'text'),
  'module_code' => array('type' => 'text'),
  'username' => array('type' => 'text'), 
  'surname' => array('type' => 'text'), 
  'forename' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.tutorial_group_id,
 g.name AS tutorial_group_name,
 m.code AS module_code,
 x.teacher_id,
 s.username,
 s.surname,
 s.forename
FROM tbl_tutorial_group_teachers x
 LEFT JOIN tbl_users s ON x.teacher_id = s.id
  LEFT JOIN tbl_tutorial_groups g ON x.tutorial_group_id = g.id
   LEFT JOIN tbl_modules m ON g.module_id = m.id
WHERE %s
 ORDER BY m.code,g.name,s.surname,s.forename
 
SQL
);

class tutorial_group_teacher extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'tutorial_group_teacher',$id,$with_defaults);
 }

 function load_teacher() {
  global $sangaku;
  $this->teacher = $sangaku->load('user',$this->teacher_id);
  return $this->teacher;
 }
}
