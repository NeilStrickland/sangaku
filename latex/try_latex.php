<?php

require_once('../vendor/autoload.php');
require_once('renderer.inc');
 
$parser = new PhpLatex_Parser();
$tree = $parser->parse(file_get_contents('min.tex'));

echo "<pre>";

var_dump($tree);

echo "</pre><br/><br/><pre>";

$renderer = new array_renderer();

echo json_encode($renderer->render($tree));

echo "</pre><br/><br/>";

$renderer = new PhpLatex_Renderer_Html();

echo $renderer->render($tree);
