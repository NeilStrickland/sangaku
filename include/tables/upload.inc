<?php

global $sangaku;

$sangaku->add_table(
 'upload','uploads',
 array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'session_id' => array('type' => 'integer','link' => 'session'),
  'item_id' => array('type' => 'integer','link' => 'question_item'),
  'student_id' => array('type' => 'integer','link' => 'user'),
  'teacher_id' => array('type' => 'integer','link' => 'user'),
  'source' => array('type' => 'text'),
  'file_extension' => array('type' => 'text'),
  'mime_type' => array('type' => 'text'),
  'is_response' => array('type' => 'boolean'),
  'timestamp' => array('type' => 'string')
 ),
 array(
  'teacher_name' => array('type' => 'text')
 ),
 <<<SQL
SELECT
 x.id,
 x.session_id,
 x.item_id,
 x.student_id,
 x.teacher_id,
 CONCAT(t.forename,' ',t.surname) AS teacher_name,
 x.source,
 x.file_extension,
 x.mime_type,
 x.is_response,
 x.timestamp
FROM tbl_uploads x
 LEFT JOIN tbl_users t ON x.teacher_id=t.id
WHERE %s
 ORDER BY x.session_id,x.item_id,x.timestamp
 
SQL
);

class upload extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'upload',$id,$with_defaults);
 }

 function load_student() {
  global $sangaku;
  $this->student = $sangaku->load('user',$this->student_id);
  return $this->student;
 }

 function load_teacher() {
  global $sangaku;
  $this->teacher = $sangaku->load('user',$this->teacher_id);
  return $this->teacher;
 }

 function file_name() {
  if (! $this->file_extension) {
   if ($this->source == 'type') {
    $this->file_extension = 'html';
   } else if ($this->source == 'webcam') {
    $this->file_extension = 'png';
   }
  }

  $n = '' . $this->id;
  if ($this->file_extension) {
   $n = $n . '.' . $this->file_extension;
  }

  return($n);
 }

 function full_file_name() {
  global $sangaku;
  
  return $sangaku->data_dir . '/uploads/' . $this->file_name();
 }

 function url() {
  return
   'https://' .
   $_SERVER['SERVER_NAME'] . 
   '/sangaku/ajax/download.php?upload_id=' .
   $this->id;
 }
 
 function set_mime_type() {
  $ext = $this->file_extension;
  $t = '';
  if ($ext == 'html') {
   $t = 'text/html';
  } else if ($ext == 'png') {
   $t = 'image/png';
  } else {
   $f = $this->full_file_name();
   if (file_exists($f)) {
    $t = mime_content_type($f);
   }
  }

  $this->mime_type = $t;
  $this->save();
 }

 function html() {
  $t = $this->mime_type();

  if (strlen($t) >= 6 && substr($t,0,6) == 'image/') {
   $content = '<img style="width:100%" src="' .
            $this->url() . '">';
  } else if ($t == "text/html") {
   $content = file_get_contents($this->full_file_name());
  } else if ($t == "text/plain") {
   $content = file_get_contents($this->full_file_name());
   $content = '<pre>' . PHP_EOL . $content . PHP_EOL . '</pre>';
  } else {
   $content = '<iframe style="width:100%" src="' .
            $this->url() . '">';
  }

  return '<div class="review">' . PHP_EOL . $content . PHP_EOL . '</div>' . PHP_EOL;
 }

 function for_json() {
  $x = new stdClass();
  $x->id             = $this->id;
  $x->session_id     = $this->session_id;
  $x->item_id        = $this->item_id;
  $x->student_id     = $this->student_id;
  $x->teacher_id     = $this->teacher_id;
  $x->teacher_name   = $this->teacher_name;
  $x->source         = $this->source;
  $x->file_extension = $this->file_extension;
  $x->mime_type      = $this->mime_type;
  $x->is_response    = $this->is_response;
  $x->timestamp      = $this->timestamp;

  return $x;
 }

 function to_json() {
  return json_encode($this->for_json());
 }
}
