<?php

require_once('include/sangaku.inc');

class user_editor extends frog_object_editor {
 function __construct() {
  global $sangaku;
  parent::__construct($sangaku,'user');

  $this->commands = 
   array(
    'load' => true,
    'suggest_delete' => true,
    'delete' => true,
    'save' => true,
    'new' => true
   );
 }

 function check_authorisation() {
  global $user;
  return ($user->status == 'teacher');
 }

 function try_alternate_keys() {
  global $sangaku;
  
  $u = get_optional_parameter('username','');
  if (! preg_match('/^[A-Za-z0-9]+$/',$u)) { $u = ''; }
  if ($u) {
   $uu = $sangaku->load_where('users',"username='{$u}'");
   if ($uu) { return $uu[0]->id; }
  }

  $i = (int) get_optional_parameter('somas_student_id',0);
  if ($i) {
   $uu = $sangaku->load_where('users',"somas_student_id=$i");
   if ($uu) { return $uu[0]->id; }
  }
  
  $i = (int) get_optional_parameter('somas_person_id',0);
  if ($i) {
   $uu = $sangaku->load_where('users',"somas_person_id=$i");
   if ($uu) { return $uu[0]->id; }
  }

  return null;
 }
 
 function associated_lists() {
  return(
   array(
    array('name' => 'registration','link' => 'student_id'),
    array('name' => 'tutorial_group_student','link' => 'student_id'),
    array('name' => 'tutorial_group_teacher','link' => 'teacher_id')
   )
  );
 }

 function edit_page() {
  global $sangaku;
  
  $H = $sangaku->html;
  $N = $sangaku->nav;
  $u = $this->object;

  $u->registrations_by_module_id = make_index($u->registrations,'module_id');
  foreach($u->registrations as $r) {
   $r->tutorial_groups = array();
  }
  $u->stray_tutorial_groups = array();
  foreach($u->tutorial_group_students as $x) {
   if (isset($u->registrations_by_module_id[$x->module_id])) {
    $r = $u->registrations_by_module_id[$x->module_id];
    $r->tutorial_groups[] = $x;
   } else {
    $u->stray_tutorial_groups[] = $x;
   }
  }

  foreach($u->registrations as $r) {
   $gg = array();
   foreach($r->tutorial_groups as $x) {
    $gg[] = $x->tutorial_group_name;
   }
   $r->tutorial_groups_string = implode(',',$gg);
  }
  
  $this->edit_page_header();

  echo $N->top_menu();
  echo $H->edged_table_start();
  echo $H->spacer_row(150,300);
  if ($u->gmail_name) {
   $m = $H->email_popup($u->gmail_name . '@sheffield.ac.uk');
  } else {
   $m = '';
  }
  
  echo $H->row($H->bold('Forename:'),$H->text_input('forename',$u->forename));
  echo $H->row($H->bold('Surname:') ,$H->text_input('surname' ,$u->surname ));
  echo $H->row($H->bold('Username:'),$H->text_input('username',$u->username));
  echo $H->row($H->bold('GMail:')   ,$H->text_input('gmail_name',$u->gmail_name) . $m);

  $s = $H->selector('status',array('student','teacher'),$u->status);
  echo $H->row($H->bold('Status:')  ,$s);
  
  echo $H->edged_table_end();

  echo '<h2>Registrations</h2>';

  echo $H->edged_table_start();
  echo $H->spacer_row(70,400,50);

  foreach($u->registrations as $r) {
   echo $H->row($r->module_code,$r->module_title,$r->tutorial_groups_string);
  }

  echo $H->edged_table_end();

  $this->edit_page_footer();
 }
}

(new user_editor())->run();
