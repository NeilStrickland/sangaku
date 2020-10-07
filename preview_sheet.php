<?php

require_once('include/sangaku.inc');

$params = get_params();
preview_page($params);

exit;

//////////////////////////////////////////////////////////////////////

function get_params() {
 global $sangaku;

 $N = $sangaku->nav;
 $H = $sangaku->html;
 
 $params = new stdClass();

 $params->problem_sheet =
   $sangaku->get_object_parameter('id','problem_sheet');

 if (! $params->problem_sheet) {
  trigger_error('Problem sheet not found',E_USER_ERROR);
  exit;
 }

 $params->problem_sheet->load_question_items();
 
 return $params;
}

function preview_page($params) {
 global $sangaku;

 $N = $sangaku->nav;
 $H = $sangaku->html;
 $s = $params->problem_sheet;
 $m = $s->load_link('module');
 
 $N->header($s->code,array('widgets' => array('mathjax')));

 $ss = $s->semester ? 'Semester ' . $s->semester : '';
 $ws = $s->week_number ? 'Week ' . $s->week_number : '';

 echo $N->top_menu();
 
 echo <<<HTML
<h1>{$s->title}<br/>
{$m->code} {$m->title} $ss $ws
</h1>

HTML
  ;

 if (trim($s->intro)) {
  echo <<<HTML
<div class="sheet_intro">
{$s->intro}
</div>

HTML
   ;
 }

 echo <<<HTML
<ul>

HTML;

 foreach($s->question_items as $i) {
  if ($i->level > 1) { continue; }
  echo "<li><span class=\"item_header\">{$i->titled_header}: </span>";
  if (trim($i->problem)) {
   echo "<span class=\"problem\">{$i->problem}</span><br/>";
  }

  if ($i->children) {
   echo "<ul>";
   foreach ($i->children as $j) {
    echo "<li><span class=\"item_header\">{$j->titled_header}: </span>";
    if (trim($j->problem)) {
     echo "<span class=\"problem\">{$j->problem}</span><br/>";
    }
    
    if ($j->children) {
     echo "<ul>";
     foreach ($j->children as $k) {
      echo "<li><span class=\"item_header\">{$k->titled_header}: </span>";
      if (trim($k->problem)) {
       echo "<span class=\"problem\">{$k->problem}</span><br/>";
      }
      echo "</li>";
     }
     echo "</ul>";
    }
    echo "</li>";
   }
   echo "</ul>";
  }
  echo "</li>";
 }
 
 echo <<<HTML
</ul>

HTML;
 
 $N->footer();
}

