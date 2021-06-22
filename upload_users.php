<?php

ini_set('display_errors',1);

require_once('include/sangaku.inc');

$params = get_params();

if ($params->command == 'upload') {
 handle_upload($params);
 upload_report_page($params);
} else {
 choose_file_page($params);
}

exit;

//////////////////////////////////////////////////////////////////////

function get_params() {
 global $sangaku;
 
 $params = new stdClass();

 $params->command =
  get_restricted_parameter('command',array('upload','choose_file'),'choose_file');

 $params->module = null;
 $params->module_id = (int) get_optional_parameter('module_id',0);

 if ($params->module_id) {
  $params->module = $sangaku->load('module',$params->module_id);
  if (! $params->module) {
   $params->module = null;
   $params->module_id = 0;
  }
 }

 if ($params->module) {
  $params->module->load_students();
 }
 
 return $params;
}

//////////////////////////////////////////////////////////////////////

function choose_file_page($params) {
 global $sangaku;
 
 $N = $sangaku->nav;
 $H = $sangaku->html;

 $N->header('Upload users',array('widgets' => array('autosuggest')));
 echo $N->top_menu();

 echo <<<HTML
<h1>Upload users</h1>
<div class="text">
 <p>
  You can use this page to upload a file of users to be added to the
  Sangaku database.  Each line in the file should contain a username,
  forename, surname and email address, enclosed in quotation marks
  and separated by commas.  If any usernames are the same as usernames
  that are already in the database, then they will be ignored.
 </p>
 <p>
  Users are assumed to be students by default.  You can change them
  to teachers after they have been created if necessary.
 </p>
 <p>
  If you choose a module in the box below, then the users will be
  registered for that module.
 </p>
</div>

HTML;

 echo <<<HTML
<form name="main_form" enctype="multipart/form-data" method="post">

HTML;

 echo $H->hidden_input('command','upload');
 
 echo $H->edged_table_start();
 echo $H->row($H->bold('Module:'),
	      $H->module_selector('module_id',$params->module_id));
 echo $H->row($H->bold('File:'),
	      $H->file_input('user_file',$params->user_file) .
	      $H->submit_button('Go'));
 
 echo $H->edged_table_end();

 echo <<<HTML
</form>

HTML;

 $N->footer();
}

//////////////////////////////////////////////////////////////////////

function handle_upload($params) {
 global $sangaku;
 
 if (! isset($_FILES['user_file'])) {
  error_page('No file specified');
  exit;
 }

 $F = $_FILES['user_file'];
 $params->F = $F;
 
 if ($F['error'] == UPLOAD_ERR_INI_SIZE) {
  error_page('File exceeds permitted maximum size of ' .
	     ini_get('upload_max_filesize'));

  exit;
 } elseif ($F['error'] != UPLOAD_ERR_OK) {
  pre_print($F);
  error_page('File upload error');
  exit;
 }
 
 $fh = fopen($F['tmp_name'],'r');

 if (! $fh) {
  error_page('Could not open uploaded file');
  exit;
 }

 $params->lines = array();
 $params->bad_lines = array();
 $params->old_users = array();
 $params->new_users = array();
 
 $i = 0;
 while (($line = fgetcsv($fh)) !== false) {
  $i++;
  $x = $sangaku->new_object('user');
  $x->line_number = $i;
  $x->line = $line;
  $x->line_string = implode(',',$line);
  $params->lines[] = $x;
  if (! $line) { continue; }
  $n = count($line);
  if ($n > 0) { $x->username = $line[0]; }
  if (! preg_match('/^[-_A-Za-z0-9]+$/',$x->username)) {
   $x->error = 'bad username';
   $params->bad_lines[] = $x;
   continue;
  }

  if ($n > 1) { $x->forename      = $line[1]; }
  if ($n > 2) { $x->surname       = $line[2]; }
  if ($n > 3) { $x->email_address = $line[3]; }

  $xx = $sangaku->load_where('user',"x.username='{$x->username}'");
  if ($xx) {
   $x->old = $xx[0];
   if ($params->module) {
    $params->module->add_student($xx[0]->id);
   }
   $params->old_users[] = $x;
  } else {
   $x->save();
   if ($params->module) {
    $params->module->add_student($x->id);
   }
   $params->new_users[] = $x;
  }
 }
}

//////////////////////////////////////////////////////////////////////

function upload_report_page($params) {
 global $sangaku;
 $N = $sangaku->nav;
 $H = $sangaku->html;

 $N->header('Upload users');
 echo $N->top_menu();

 echo <<<HTML
<h1>Users uploaded</h1>

HTML;

 if ($params->bad_lines) {
  echo <<<HTML
<div class="text">
 The following lines had errors and were ignored.
</div>

HTML;

  echo $H->edged_table_start();
  echo $H->row('Line','','Error');
  
  foreach($params->bad_lines as $x) {
   $s = $x->line_string;
   if (strlen($s) > 50) {
    $s = substr($s,0,50) . '...';
   }

   echo($H->row($x->line_number,$s,$x->error));
  }
  
  echo $H->edged_table_end();
  echo "<br/>";
 }

 if ($params->old_users) {
  if ($params->module) {
   echo <<<HTML
<div class="text">
 The following lines refer to usernames that exist in the database
 already.  They have been registered for {$params->module->code}
 (if they were not already registered).
</div>

HTML;
  } else {
   echo <<<HTML
<div class="text">
 The following lines refer to usernames that exist in the database
 already.  They have been ignored.
</div>

HTML;

  }

  echo $H->edged_table_start();
  echo $H->row('Line','Username','Forename','Surname','Email address');
  
  foreach($params->old_users as $x) {
   $y = $x->old;
   echo $H->row($x->line_number,$y->username,$y->forename,$y->surname,$y->email_address);
  }
  
  echo $H->edged_table_end();  
  echo "<br/>";
 }
 
 if ($params->old_users) {
  if ($params->module) {
   echo <<<HTML
<div class="text">
 The following users have been created and registered for
 {$params->module->code}.
</div>

HTML;
  } else {
   echo <<<HTML
<div class="text">
 The following users have been created.
</div>

HTML;

  }

  echo $H->edged_table_start();
  echo $H->row('Line','Username','Forename','Surname','Email address');
  
  foreach($params->new_users as $x) {
   echo $H->row($x->line_number,$x->username,$x->forename,$x->surname,$x->email_address);
  }
  
  echo $H->edged_table_end();  
  echo "<br/>";
 }
 
 $N->footer();
}
