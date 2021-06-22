<?php

$allow_bot = 1;
$sangaku = new stdClass();
require_once('../include/config.inc'); 

if (isset($sangaku->data_dir) && $sangaku->data_dir) {
 $d = $sangaku->data_dir;
 if (is_dir($d)) {
  echo "Top data directory ($d) exists already\n";
 } else {
  $x = mkdir($d);
  if ($x) {
   echo "Top data dir ($d) created.\n";
  } else {
   echo "Could not create top data dir ($d).\n";
   exit;
  }
 }

 $subdirs = array('google','log','sessions','snapshots','uploads');
 foreach($subdirs as $s) {
  $ds = $d . '/' . $s;
  if (is_dir($ds)) {
   echo "Subdirectory $s exists already\n";
  } else {
   $x = mkdir($ds);
   if ($x) {
    echo "Subdirectory $s created.\n";
   } else {
    echo "Could not create subdirectory $s.\n";
    exit;
   }
  }
 }
} else {
 echo "Data directory not specified, doing nothing.\n";
}