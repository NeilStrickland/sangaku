<?php

require_once('../include/sangaku.inc');

$debug = true;

$params = $sangaku->get_session_student_params();

if (! ($params->is_valid && $params->item)) {
 if ($debug) {
  pre_print($params);
 }

 exit;
}

$source = get_restricted_parameter('source',
                                   array('type','camera','phone','file'),
                                   'type');

$u = $sangaku->new_object('upload');

$u->session_id = $params->session_id;
$u->item_id    = $params->item_id;
$u->student_id = $params->student_id;

if ($user->status == 'teacher') {
 $teacher_id = (int) get_optional_parameter('teacher_id',0);
 if ($teacher_id == $user->id) {
  $u->teacher_id = $teacher_id;
 }
}
    
$u->source = $source;
$u->save();

$allowed_types = array(
 "image/png"  => "png",
 "image/jpeg" => "jpg",
 "text/plain" => "txt",
 "text/html"  => "html",
 "application/pdf" => "pdf"
);
               
if ($source == 'type') {
 $u->file_extension = 'html';
 $u->mime_type = 'text/html';
 $u->save();
 $u->load();
 $f = $u->full_file_name();
 $content = get_required_parameter('content');
 file_put_contents($f,$content);
 echo $u->to_json();
} else if ($source == 'camera' || $source == 'phone') {
 $u->file_extension = 'png';
 $u->mime_type = 'image/png';
 $u->save();
 $u->load();
 $f = $u->full_file_name();
 $content = get_required_parameter('content');
 list($type,$content) = explode(';',$content);
 list(,$content) = explode(',',$content);
 $content = base64_decode(str_replace(' ','+',$content));
 $fh = fopen($f,'wb');
 fwrite($fh,$content);
 fclose($fh);
 echo $u->to_json();
} else if ($source == 'file') {
 $z = $_FILES['upload_file'];
 if ($z['error']) {
  if ($debug) { echo "Upload error code: " . $z['error']; }
  exit;
 }
 $mime_type = mime_content_type($z['tmp_name']);
 if (isset($allowed_types[$mime_type])) {
  $u->file_extension = $allowed_types[$mime_type];
  $u->mime_type = $mime_type;
  $u->save();
  $u->load();
  $f = $u->full_file_name();
  move_uploaded_file($z['tmp_name'],$f);
  echo $u->to_json();
 } else {
  if ($debug) { echo "Bad mime type: {$mime_type}"; }
 }
}

