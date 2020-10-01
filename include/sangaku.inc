<?php

//ini_set('display_errors','On');


$frog_dir = $_SERVER['DOCUMENT_ROOT'] . '/include/frog';
require_once($frog_dir . '/frog.inc');

require_once('sangaku_class.inc');

$sangaku = new sangaku_class();
$sangaku->name = 'sangaku';
$sangaku->include_dir = dirname(__FILE__);

$sangaku->data_dir = "/var/sangaku";
$sangaku->log_dir = $sangaku->data_dir . '/log';
$sangaku->login_log_file = $sangaku->log_dir . '/login_log.txt';
$sangaku->uploads_dir = $sangaku->data_dir . "/uploads";
$sangaku->sessions_dir = $sangaku->data_dir . "/sessions";

$cred = trim(file_get_contents($sangaku->data_dir . '/cred.txt'));
$sangaku->connect('sangaku',$cred,'sangaku');
$cred = '';

mb_internal_encoding("UTF-8");
mb_regex_encoding("UTF-8");
mb_http_output("UTF-8");

ini_set('default_charset','utf-8');
ini_set('session.save_path',$sangaku->sessions_dir);
ini_set('session.gc_maxlifetime',7200);

if (! session_id()) { session_start(); }

$sangaku->register('module');
$sangaku->register('problem_sheet');
$sangaku->register('question_item');
$sangaku->register('registration');
$sangaku->register('session');
$sangaku->register('status','statuses');
$sangaku->register('status_report');
$sangaku->register('tutorial_group');
$sangaku->register('tutorial_group_student');
$sangaku->register('tutorial_group_teacher');
$sangaku->register('upload');
$sangaku->register('user');

$sangaku->load_table('status');
$sangaku->load_all('status');

require_once('auth.inc');
require_once('navigator.inc');

$sangaku->html = new frog_html($sangaku);
$sangaku->nav  = new sangaku_navigator($sangaku);
$sangaku->auth = new sangaku_auth($sangaku);

$f = $_SERVER['PHP_SELF'];

if (! ($f == '/sangaku/login.php' ||
       $f == '/sangaku/logout.php')) {
 $sangaku->auth->require_login();
}


?>
