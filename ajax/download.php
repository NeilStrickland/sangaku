<?php

$debug = 0;

require_once('../include/sangaku.inc');

$upload_id = (int) get_optional_parameter('upload_id',0);
if (! $upload_id) {
 if ($debug) { echo "No upload id"; }
 exit;
}

$upload = $sangaku->load('upload',$upload_id);
if (! $upload) {
 if ($debug) { echo "Upload {$upload_id} not found"; }
 exit;
}

if ($debug) {
 echo "Mime type : {$upload->mime_type}<br/>";
 echo "Filename : {$upload->file_name()}<br/>";
 echo "Full filename : {$upload->full_file_name()}<br/>";
 if (file_exists($upload->full_file_name())) {
  echo "File exists<br/>";
 } else {
  echo "File does not exist<br/>";
 }

 exit;
}

if (! file_exists($upload->full_file_name())) {
 $upload->delete();
 exit;
}

header('Content-Type: ' . $upload->mime_type);
header('Content-Disposition: inline; filename=' . $upload->file_name());


readfile($upload->full_file_name());
