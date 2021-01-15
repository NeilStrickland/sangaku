<?php

xdebug_disable();
ini_set('html_errors',0);
ini_set('xdebug.overload_var_dump',0);

$allow_bot = 1;

require_once('../include/sangaku.inc');

$session = $sangaku->get_object_parameter('session');

if (! $session) { exit; }

$s = $sangaku->new_object('snapshot');

$s->session_id = $session->id;
$s->save();

$allowed_types = array(
 "image/png"  => "png",
 "image/jpeg" => "jpg",
 "text/plain" => "txt",
 "text/html"  => "html",
 "application/pdf" => "pdf"
);

$z = $_FILES['snapshot_file'];
if ($z['error']) {
 if ($debug) { echo "Upload error code: " . $z['error']; }
 exit;
}
$mime_type = mime_content_type($z['tmp_name']);
if (isset($allowed_types[$mime_type])) {
 $s->file_extension = $allowed_types[$mime_type];
 $s->mime_type = $mime_type;
 $s->file_extension = $allowed_types[$mime_type];
 $s->save();
 $s->load();
 $f = $s->full_file_name();
 move_uploaded_file($z['tmp_name'],$f);
 echo $s->to_json();
} else {
 if ($debug) { echo "Bad mime type: {$mime_type}"; }
}

