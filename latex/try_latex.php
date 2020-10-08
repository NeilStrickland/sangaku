<?php

require_once('../vendor/autoload.php');
require_once('renderer.inc');
 
$parser = new PhpLatex_Parser();
$tex = file_get_contents('b.tex');
$i = strpos($tex,'\begin{document}');
if ($i === false) {
 echo "Could not find beginning" . PHP_EOL;
 exit;
}

$tex = substr($tex,$i);

$tree = $parser->parse($tex);

echo "<pre>";

var_dump($tree);

echo "</pre><br/><br/><pre>";

$renderer = new array_renderer();

echo json_encode($renderer->render($tree));

echo "</pre><br/><br/>";

$renderer = new PhpLatex_Renderer_Html();

echo $renderer->render($tree);
