<?php

$allow_bot = 1;
$debug = 0;

require_once('../include/sangaku.inc');

$snapshot_id = (int) get_optional_parameter('snapshot_id',0);
if (! $snapshot_id) {
 if ($debug) { echo "No snapshot id"; }
 exit;
}

$snapshot = $sangaku->load('snapshot',$snapshot_id);
if (! $snapshot) {
 if ($debug) { echo "Snapshot {$snapshot_id} not found"; }
 exit;
}

if ($debug) {
 echo "Mime type : {$snapshot->mime_type}<br/>";
 echo "Filename : {$snapshot->file_name()}<br/>";
 echo "Full filename : {$snapshot->full_file_name()}<br/>";
 if (file_exists($snapshot->full_file_name())) {
  echo "File exists<br/>";
 } else {
  echo "File does not exist<br/>";
 }

 exit;
}

if (! file_exists($snapshot->full_file_name())) {
 $snapshot->delete();
 exit;
}

header('Content-Type: ' . $snapshot->mime_type);
header('Content-Disposition: inline; filename=' . $snapshot->file_name());

readfile($snapshot->full_file_name());
