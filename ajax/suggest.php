<?php

require_once('../../include/frog/suggester.inc');
require_once('../include/sangaku.inc');
require_once('../include/suggester.inc');
require_once('../include/config.inc');

if (! (
 isset($_SESSION['sangaku_user_id']) &&
 $_SESSION['sangaku_user_id'] &&
 isset($_SESSION['sangaku_logged_in_teacher']) &&
 $_SESSION['sangaku_logged_in_teacher']
)) {
 exit;
}

if (! (isset($_REQUEST['type']) && $_REQUEST['type'])) {
 exit;
}

$type = $_REQUEST['type'];

$suggester = null;

$sc = $type . '_suggester';

if (class_exists($sc)) {
 $suggester = new $sc;
}

if ($suggester) {
 $suggester->run();
}





