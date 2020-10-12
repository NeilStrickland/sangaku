<?php

require_once('include/sangaku.inc');

$session = $sangaku->get_object_parameter('session');

if (! $session) { exit; }

$N = $sangaku->nav;
$H = $sangaku->html;

$N->header(
 'Snapshots',
 array(
  'widgets' => array('mathjax'),
  'scripts' => array('snapshot_gallery'),
  'styles' => array('snapshot_gallery')
 )
);

echo <<<HTML
  <h1>{$session->problem_sheet_title} Group {$session->module_code}({$session->tutorial_group_name})</h1>
  <span id="intro">Visualiser snapshots will appear below.</span>
  <div id="gallery"></div>
  <br/><br/>
  <div id="thumbs"></div>
  <a id="prev">&#10094;</a>
  <a id="next">&#10095;</a>
  <script>
   var v = Object.create(sangaku.snapshot_gallery);
   v.init({$session->id});
  </script>

HTML
   ;

$N->footer();
