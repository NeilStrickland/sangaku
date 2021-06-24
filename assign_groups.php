<?php

require_once('include/sangaku.inc');

$params = get_params();

if ($params->module) {
 assign_groups_page($params);
} else {
 choose_module_page($params);
}

exit;

//////////////////////////////////////////////////////////////////////

function get_params() {
 global $sangaku;

 $params = new stdClass();
 $params->module_id = (int) get_optional_parameter('module_id',0);
 $params->module = null;
 if ($params->module_id) {
  $params->module = $sangaku->load('module',$params->module_id);
 }

 if ($params->module) { 
  $params->module->load_associated();
 }
  
 return $params;
}

//////////////////////////////////////////////////////////////////////

function choose_module_page($params) {
 global $sangaku;
 $N = $sangaku->nav;
 $H = $sangaku->html;

 $N->header('Assign groups',['widgets' => ['autosuggest']]);
 echo $N->top_menu();

 $s = $H->module_selector('module_id');
 $b = $H->submit_button('Go');

 echo <<<HTML
<h1>Assign students to groups</h1>
<br/>
<form name="main_form">
Choose module: $s $b
</form>

HTML;

 $N->footer();
}

//////////////////////////////////////////////////////////////////////

function json_data($params) {
 $m = $params->module;

 $groups = [];
 foreach($m->tutorial_groups as $g) {
  $groups[] = [$g->id,$g->name];
 }

 $students = [];
 foreach($m->students as $s) {
  $students[] = [$s->id,$s->username,$s->surname,$s->forename];
 }

 $group_memberships = [];
 foreach($m->group_memberships as $x) {
  $group_memberships[] = [$x->id,$x->student_id,$x->tutorial_group_id];
 }

 $json = 
  'var groups = ' . json_encode($groups) . ";\n" . 
  'var students = ' . json_encode($students) . ";\n" .
  'var group_memberships = ' . json_encode($group_memberships) . ";\n";

 return $json;
}

//////////////////////////////////////////////////////////////////////

function assign_groups_page($params) {
 global $sangaku;
 $N = $sangaku->nav;
 $H = $sangaku->html;
 $m = $params->module;

 $N->header('Assign groups',
            ['widgets' => ['autosuggest'],
             'scripts' => ['assign_groups'],
             'inline_script' => json_data($params),
             'onload' => 'sangaku.assign_groups.init()'
            ]);

 echo $N->top_menu();

 $h = <<<HTML
  <tr>
   <td style="width:100px">Username</td>
   <td style="width:300px">Name</td>

HTML;

 foreach($m->tutorial_groups as $g) {
  $h .= '<td>' . $g->name . '</td>';
 }

 $h .= "\n </tr>\n";

 echo <<<HTML
<h1>Assign students to tutorial groups for {$m->code}</h1>
<br/>
<table class="edged">
 <tbody id="students_tbody">
  $h
 </tbody>
</table>

HTML;

 $N->footer();
}