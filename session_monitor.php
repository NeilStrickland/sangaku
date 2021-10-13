<?php

require_once('include/sangaku.inc');

$session_id = (int) get_optional_parameter('session_id',0);
if ($session_id) {
 $session = $sangaku->load('session',$session_id);
 $session->load_associated();
} else {
 $session = null;
}

if ($session) {
 show_status_page($session);
} else {
 choose_session_page();
}

//////////////////////////////////////////////////////////////////////

function choose_session_page() {
 echo "Not yet implemented";
}

//////////////////////////////////////////////////////////////////////

function show_status_page($session) {
 global $sangaku;
 
 $b = $sangaku->nav->top_session_menu($session->id);
 $m = $sangaku->nav->mathjax_script();

 echo <<<HTML
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8">
$m
  <script src="js/qrcodejs/qrcode.min.js"></script>
  <script src="js/frog.js"></script>
  <script src="js/objects_auto.js"></script>
  <script src="js/sangaku.js"></script>
  <script src="js/session_monitor.js"></script>
  <script src="js/tabber.js"></script>
  <link rel="stylesheet" href="css/sangaku.css">
  <link rel="stylesheet" href="css/tabber.css">
 </head>
 <body style="width:100%">
$b<br/><br/>
  <div class="tabber" id="session_monitor_tabber_{$session->id}">

HTML;

 session_tab($session);

 if ($session->is_online) {
  monitor_tab($session);
 }

 if ($session->problem_sheet) {
  sheet_tab($session);
 }

 if ($session->poll_instances) {
  polls_tab($session);
 }

 if (false) {
  // This is disabled as it is heavily reliant on additional
  // software on NPS's home PC.
  snapshots_tab($session);
 }
 
 echo <<<HTML
  </div>
  <script>
   var v = Object.create(sangaku.session_monitor);
   v.init({$session->id});

   function copy_login_url() {
    var e = document.getElementById('login_url');
    var t = document.createElement('textarea');
    t.className = 'temp';
    t.value = e.innerText;
    document.body.appendChild(t);
    t.focus(); 
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
   }
  </script>
 </body>
</html>

HTML
;
}

//////////////////////////////////////////////////////////////////////

function session_tab($session) {
 $bb = '';
 $video_url = $session->effective_video_url();
 if ($video_url) {
  $bb = <<<HTML
    <br/>
    <div style="width:700px">
     <button type="button" onclick="window.open('{$video_url}')">{$session->video_url_description}</button>
    </div>
    <br/>
HTML
      ;
 }

 if ($session->is_online) {
  $bb_msg = <<<HTML
     <br/><br/>
     Share this URL in Blackboard Collaborate chat.  Remember that students
     cannot see messages posted before they joined the session, so you should
     share the URL several times.

HTML;
 } else {
  $bb_msg = '';
 }

 $student_login_url =
   'https://' . $_SERVER['HTTP_HOST'] . '/sangaku/' . $session->id;

 $title = '';
 
 if ($session->problem_sheet_id) {
  $title .= $session->problem_sheet_title . '<br/>';
 }
 
 if ($session->is_lecture) {
  $title .= $session->module_code . ' Lecture';
 } elseif ($session->tutorial_group_name) {
  $title .= 'Group ' . $session->module_code . ' (' .
         $session->tutorial_group_name . ')';
 } else {
  $title .= $session->module_code;
 }
 
 echo <<<HTML
   <div class="tabbertab" id="session_tab">
    <h2>Session</h2>
    <br/><br/>
    <div id="session_header">$title</div>
    <br/><br/>
    <div style="width:700px">
     Student login URL:
     <code id="login_url" style="color: blue; font-size: 150%">{$student_login_url}</code>
     <button type="button" onclick="copy_login_url()">Copy</button>
     $bb_msg
    </div>
$bb
   </div>

HTML;

}

//////////////////////////////////////////////////////////////////////

function monitor_tab($session) {
 echo <<<HTML
   <div class="tabbertab" id="monitor_tab">
    <h2>Monitor</h2>
   </div>

HTML;
}

//////////////////////////////////////////////////////////////////////

function sheet_tab($session) {
 echo <<<HTML
   <div class="tabbertab" id="sheet_tab">
    <h2>Problem Sheet</h2>
    <br/><br/>
    <div style="max-width:800px">
     {$session->problem_sheet->preview()}
    </div>
   </div>

HTML;
}

//////////////////////////////////////////////////////////////////////

function snapshots_tab($session) {
 echo <<<HTML
   <div class="tabbertab" id="snapshots_tab">
    <h2>Snapshots</h2>
   </div>

HTML;
}

//////////////////////////////////////////////////////////////////////

function polls_tab($session) {
 echo <<<HTML
   <div class="tabbertab" id="polls_tab">
    <h2>Polls</h2>
    <br/>
   </div>

HTML;
}

//////////////////////////////////////////////////////////////////////

function help_tab($session) {
 echo <<<HTML
   <div class="tabbertab" id="help_tab">
    <h2>Help</h2>
   </div>

HTML;
}
