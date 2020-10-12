<?php

global $sangaku;

$sangaku->add_table(
 'snapshot','snapshots',
 array(		
  'id' => array('type' => 'integer','notnull' => 'true'),
  'session_id' => array('type' => 'integer','link' => 'session'),
  'file_extension' => array('type' => 'text'),
  'mime_type' => array('type' => 'text'),
  'timestamp' => array('type' => 'string')
 ),
 array(
 ),
 <<<SQL
SELECT
 x.id,
 x.session_id,
 x.file_extension,
 x.mime_type,
 x.timestamp
FROM tbl_snapshots x
WHERE %s
 ORDER BY x.session_id,x.timestamp
 
SQL
);

class snapshot extends frog_object {
 function __construct($id = null,$with_defaults=1) {
  global $sangaku;

  parent::__construct($sangaku,'snapshot',$id,$with_defaults);
 }

 function file_name() {
  $n = '' . $this->id;
  if ($this->file_extension) {
   $n = $n . '.' . $this->file_extension;
  }

  return($n);
 }

 function full_file_name() {
  global $sangaku;
  
  return $sangaku->data_dir . '/snapshots/' . $this->file_name();
 }

 function url() {
  return
   'https://' .
   $_SERVER['SERVER_NAME'] . 
   '/sangaku/ajax/download_snapshot.php?snapshot_id=' .
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

  return '<div class="snapshot">' . PHP_EOL . $content . PHP_EOL . '</div>' . PHP_EOL;
 }

 function for_json() {
  $x = new stdClass();
  $x->id             = $this->id;
  $x->session_id     = $this->session_id;
  $x->file_extension = $this->file_extension;
  $x->mime_type      = $this->mime_type;
  $x->timestamp      = $this->timestamp;

  return $x;
 }

 function to_json() {
  return json_encode($this->for_json());
 }
}
