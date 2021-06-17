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
    'new' => true,
    'generate_password' => true,
    'delete_password' => true
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

 function listing_url() {
  return '/sangaku/user_list.php';
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
  global $sangaku,$user;
  
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
  if ($u->email_address) {
   $m = $H->email_popup($u->email_address);
  } else if ($u->gmail_name) {
   $m = $H->email_popup($u->gmail_name . '@sheffield.ac.uk');
  } else {
   $m = '';
  }
  
  echo $H->row($H->bold('Forename:'),$H->text_input('forename',$u->forename));
  echo $H->row($H->bold('Surname:') ,$H->text_input('surname' ,$u->surname ));
  echo $H->row($H->bold('Username:'),$H->text_input('username',$u->username));
//  echo $H->row($H->bold('GMail:')   ,$H->text_input('gmail_name',$u->gmail_name) . $m);
  echo $H->row($H->bold('Email:')   ,$H->text_input('email_address',$u->email_address) . $m);

  $s = $H->selector('status',array('student','teacher'),$u->status);
  echo $H->row($H->bold('Status:')  ,$s);

  $c = $H->checkbox('is_admin',$u->is_admin);
  echo $H->row($H->bold('Administrator:')  ,$c);

  echo $H->edged_table_end();

  if ($user->is_admin) {
   $this->password_block();
  }
  
  if ($u->registrations) {
   $this->registrations_block();
  }
  
  $this->edit_page_footer();
 }

 function registrations_block() {
  global $sangaku;
  
  $H = $sangaku->html;
  $u = $this->object;

  echo '<h2>Registrations</h2>';

  echo $H->edged_table_start();
  echo $H->spacer_row(70,400,50);

  foreach($u->registrations as $r) {
   echo $H->row($r->module_code,$r->module_title,$r->tutorial_groups_string);
  }

  echo $H->edged_table_end();

 }

 function password_block() {
  global $sangaku;
  
  $H = $sangaku->html;
  $u = $this->object;

  $new_pw_url = "user_info.php?id={$u->id}&command=generate_password";
  $delete_pw_url = "user_info.php?id={$u->id}&command=delete_password";
  
  echo '<h2>Password</h2>';

  if ($u->email_address) {
   if ($u->password_hash) {
    echo <<<HTML
<div class="text">
 <p>
  This user has a hashed password in the Sangaku database.  Because
  the password has been hashed, Sangaku cannot reveal it, but
  Sangaku can check whether the password has been entered correctly.
  Because there is a password in the database, Sangaku will check 
  the password directly rather than passing it to an LDAP server.
 </p>
 <p>
  You can generate a new password, in which case it will be sent to
  the user by email.  Alternatively, you can delete the password.
  If the password in the database is deleted, then Sangaku will
  ask the LDAP server to check the password entered by the user.
 </p>
 <button type="button" onclick="location='$new_pw_url'">
  Generate a new password
 </button>
 &nbsp;&nbsp;&nbsp;
 <button type="button" onclick="location='$delete_pw_url'">
  Delete password
 </button> 
</div>

HTML;
   } else {
    echo <<<HTML
<div class="text">
 <p>
  This user does not have a password in the Sangaku database.
  If they attempt to log in, then the password that they enter
  will be sent to the LDAP server for verification.
 </p>
 <p>
  If this user is not known to the LDAP server, then you can
  give them a password in the Sangaku database instead, by
  clicking 'Generate password' below.  The password will
  then be sent to them by email.  
 </p>
 <br/><br/>
 <button type="button" onclick="location='$new_pw_url'">
  Generate password
 </button>
</div>

HTML;
   }
  } else {
   if ($u->password_hash) {
    echo <<<HTML
<div class="text">
 <p>
  This user has a hashed password in the Sangaku database.  Because
  the password has been hashed, Sangaku cannot reveal it, but
  Sangaku can check whether the password has been entered correctly.
  Because there is a password in the database, Sangaku will check 
  the password directly rather than passing it to an LDAP server.
 </p>
 <p>
  However, Sangaku does not have an email address for this user,
  which means that they probably do not know their password.
  You should enter and save an email address, then generate
  a new password, which will be emailed to the user.
 </p>
 <p>
  Alternatively, you can delete the password.
  If the password in the database is deleted, then Sangaku will
  ask the LDAP server to check the password entered by the user.
 </p>
 <br/><br/>
 <button type="button" onclick="location='$delete_pw_url'">
  Generate a new password
 </button> 
</div>

HTML;
   } else {
    echo <<<HTML
<div class="text">
 <p>
  This user does not have a password in the Sangaku database.
  If they attempt to log in, then the password that they enter
  will be sent to the LDAP server for verification.
 </p>
 <p>
  If this user is not known to the LDAP server, then you can
  give them a password in the Sangaku database instead.
  However, you will first need to enter and save an email
  address that can be used to inform the user of their
  password.
 </p>
</div>

HTML;
   }
  }
 }

 function handle_command() {
  if ($this->command == 'generate_password') {
   $this->generate_password();
  } elseif ($this->command == 'delete_password') {
   $this->delete_password();
  }
 }

 function generate_password() {
  global $sangaku,$user;
  
  $A = $sangaku->auth;
  $H = $sangaku->html;
  $N = $sangaku->nav;
  $this->load_from_database();
  $u = $this->object;

  if (! $user->is_admin) { error_page('Not authorised'); exit; }
  if (! $u) { error_page('No user'); exit; }
  if (! $u->email_address) {
   error_page('User has no email address, so cannot be notified of a new password.');
   exit;
  }

  $u->had_password = $u->password_hash ? 1 : 0;
  $ret = $A->generate_and_notify_password($u);

  if (! $ret) {
   error_page(<<<TEXT
A new password was generated for user {$u->username}, and we attempted
to send it by email to {$u->email_address}.  However, this email failed
for some reason.

TEXT
   );
   exit;
  }

  $N->header('New password generated');
  echo $N->top_menu();
  
  echo <<<HTML
<h1>New password generated</h1>
<div class="text">
<p>
A new password was generated for user {$u->username} ($u->full_name)
and was sent to them by email at <code>{$u->email_address}</code>.
</p>

HTML;

  if ($u->had_password) {
   echo <<<HTML
<p>
This new password replaces the old one, which will no longer work.
</p>
HTML;
  } else {
   echo <<<HTML
<p>
As this user now has a password in the database, Sangaku will no
longer attempt to use the LDAP server to check their password.
</p>
HTML;

  }

  $edit_url = "user_info.php?id={$u->id}";
  
  echo <<<HTML
<br/>
<button type="button" onclick="location='$edit_url'">Return to user information page</button>

HTML;

  $N->footer();
 }

 function delete_password() {
  global $sangaku,$user;
  
  $A = $sangaku->auth;
  $H = $sangaku->html;
  $N = $sangaku->nav;
  $this->load_from_database();
  $u = $this->object;

  if (! $user->is_admin) { error_page('Not authorised'); exit; }
  if (! $u) { error_page('No user'); exit; }

  $u->password_hash = '';
  $u->save();
  
  $N->header('Password deleted');
  echo $N->top_menu();

  echo <<<HTML
<h1>Password deleted</h1>
<div class="text">
<p>
The password in the Sangaku database for user {$u->username} ($u->full_name)
was deleted.  If they attempt to log in, then Sangaku will use the LDAP
server to check their password.
</p>

HTML;

  $edit_url = "user_info.php?id={$u->id}";
  
  echo <<<HTML
<br/>
<button type="button" onclick="location='$edit_url'">Return to user information page</button>

HTML;

  $N->footer();
 }
}

(new user_editor())->run();
