<?php

require __DIR__ . '/vendor/autoload.php';

$input = file_get_contents('a.tex');
$parser = new PhpLatex_Parser();
$parsedTree = $this->parse($input);

var_dump($parsedTree);
