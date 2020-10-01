<?php

require_once('include/sangaku.inc');

echo "Generating javascript representation of Sangaku database schema";
echo "<br/>" . PHP_EOL;

$decl = $sangaku->javascript_declaration();

$statuses0 = $sangaku->load_all('statuses');

$statuses = array();
foreach($statuses0 as $x0) {
 $statuses[] = $x0->for_json();
}
$statuses = json_encode($statuses);

$script = <<<JS
$decl

sangaku.statuses={$statuses}.map(function(x) {
return Object.assign(Object.create(sangaku.status),x);
});

JS;

file_put_contents('js/objects_auto.js',$script);

echo "Done";
echo "<br/>" . PHP_EOL;
