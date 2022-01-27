<?php

$allow_bot = 1;

require_once('include/sangaku.inc');

$session = $sangaku->get_session_parameter();

if (! $session) {
 error_page('Session not found');
 exit;
}

$N = $sangaku->nav;
$H = $sangaku->html;
$m = $N->mathjax_script();

$O = array(
 'scripts' => array('snapshot_gallery'),
 'styles' => array('snapshot_gallery')
);
   
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

echo $N->header('Snapshots',$O);

echo <<<HTML
<h1>Live snapshots: $title</h1>
<span id="intro">Visualiser snapshots will appear below.</span>
<div id="gallery">
<a id="prev">&#10094;</a>
<a id="next">&#10095;</a>
</div>
<br/><br/>
<div id="thumbs"></div>
<script>
 var v = Object.create(sangaku.snapshot_gallery);
 v.init({$session->id});
</script>
HTML
 ;

$N->footer();
