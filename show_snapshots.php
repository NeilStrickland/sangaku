<?php

require_once('include/sangaku.inc');

$session = $sangaku->get_object_parameter('session');

if (! $session) { exit; }

$N = $sangaku->nav;
$H = $sangaku->html;

echo <<<HTML
<!DOCTYPE HTML>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Snapshots</title>
<script type="text/javascript" src="/sangaku/js/frog.js"></script>
<script type="text/javascript" src="/sangaku/js/objects_auto.js?1602487999"></script>
<script type="text/javascript" src="/sangaku/js/sangaku.js?1602123019"></script>
<style type="text/css" media="screen">
  @import url(/sangaku/css/sangaku.css?1602508506);
</style>
  <script>MathJax = { tex : { inlineMath : [['$','$'],['\\(','\\)']] }};</script>
  <script id="MathJax-script" async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<script type="text/javascript" src="/sangaku/js/snapshot_gallery.js?1602489216"></script>
<style type="text/css" media="screen">
  @import url(/sangaku/css/snapshot_gallery.css?1602488992);
</style>
</head>
<body >
<h1>General logarithms and hyperbolic functions Group EngL1(7a)</h1>
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
</body>
</html>
HTML
 ;

$N->footer();
