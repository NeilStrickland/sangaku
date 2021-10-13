<?php

require_once('include/sangaku.inc');
 
class poll_editor extends frog_object_editor {
 function __construct() {
  global $sangaku;
  parent::__construct($sangaku,'poll');

  $this->commands = 
   array(
    'display' => true,
    'load' => true,
    'create_instances' => true,
    'suggest_delete' => true,
    'delete' => true,
    'save' => true,
    'new' => true
   );

 }

 function parent_table() {
  return 'module';
 }
 
 function associated_lists() {
  return array(
   array('name' => 'poll_item')
  );
 }

 function listing_url() {
  $s = $this->object;
  if ($s && $s->module_id) {
   return 'poll_list.php?module_id=' . $s->module_id;
  } else {
   return 'poll_list.php';
  }
 }

 function edit_page_title() {
  if ($this->command == 'new') {
   return('New poll');
  } else {
   $t = $this->object->descriptor();
   if ($this->command == 'clone') {
    $t .= ' (copy)';
   }
   return($t);
  }
 }

 function edit_page_widgets() {
  return array('mathjax','autosuggest');
 }
 
 function edit_page_scripts() {
  return array('poll_editor');
 }
 
 function edit_page_styles() {
  return array('poll_editor');
 }
 
 function edit_page_onload() {
  $id = $this->object->id;
  if (! $id) { $id = 0; }
  return "sangaku.poll_editor.init($id)";
 }
 
 function edit_page_command_bar() {
  $html = <<<HTML
<table>
 <tr>
  <td id="save_td" class="command" width="80" onclick="frog.do_command('save');">Save</td>
HTML
        ;

  if ($this->object->id) {
   $html .= <<<HTML
  <td id="load_td" class="command" width="80" onclick="frog.do_command('load');">Restore</td>
  <td id="view_td" class="command" width="80" onclick="frog.do_command('display');">View</td>
  <td id="create_td" class="command" width="150" onclick="frog.do_command('create_instances');">Create instances</td>

HTML
        ;

   if (isset($this->commands['suggest_delete'])) {
    $html .= <<<HTML
  <td id="suggest_delete_td" class="command" width="80" onclick="frog.do_command('suggest_delete');">Delete</td>

HTML
         ;
   }
  }
  
  $u = $this->listing_url();
  if ($u) {
   $html .= <<<HTML
  <td id="listing_td" class="command" width="80" onclick="location='$u';">Index</td>

HTML
         ;
  }

  $html .= <<<HTML
 </tr>
</table>

HTML
        ;

  return $html;
 }

 function load_from_database() {
  $ok = parent::load_from_database();
  if ($ok) { $this->object->load_items(); }
  return $ok;
 }

 function load_associated_lists_from_request() {
  global $sangaku;

  $items = get_optional_parameter('items','');
  if (! $items) { return null; }

  $items = json_decode($items);
  foreach($items as $item0) {
   $item = $sangaku->new_object('poll_item');
   $keys = array('id','poll_id','sequence_number','code','text','is_correct');
   foreach ($keys as $k) { $item->$k = $item0->$k; }
   $item->save();
  }

  $deletions = json_decode(get_required_parameter('deletions'));

  foreach($deletions as $id) {
   $item = $sangaku->delete('poll_item',$id);
  }

  $this->object->load_items();
 }

 function edit_page() {
  global $sangaku;
  
  $H = $sangaku->html;
  $N = $sangaku->nav;
  $s = $this->object;
  $m = $s->load_link('module');
  if ($m) { $m->load_associated(); }

  $modules = $sangaku->load_all('modules');
  $module_opts = array();
  foreach ($modules as $x) {
   $x0 = new stdClass();
   $x0->id = $x->id;
   $x0->display = $x->code . ' (' . $x->title . ')';
   $module_opts[] = $x0;
  }
  
  $module_selector = $H->module_selector('module_id',$s->module_id);
  $sheet_selector = $H->problem_sheet_selector('problem_sheet_id',
                                               $s->problem_sheet_id,
                                               array('module_id' => $s->module_id,
                                                     'size' => 50));
  
  $this->edit_page_header();

  echo $N->top_menu();

  $explain_code = <<<HTML
Here you can enter a short code to identify this poll.
Polls wil be sorted alphabetically by code in various places,
so if you want polls to appear in a particular order then 
you should set the codes accordingly.
HTML;
  
  $explain_judgemental = <<<HTML
You should mark the poll as judgemental if you want to classify 
some responses as correct and others as incorrect.
HTML;
  
  $explain_multiple = <<<HTML
You should mark the poll as multiple if you want to allow 
students to select more than one of the items.
HTML;
  
  echo $H->edged_table_start();
  echo $H->spacer_row(160,440);
  echo $H->row($H->bold('Module:'),$module_selector);

  if ($m->problem_sheets) {
   echo $H->row($H->bold('Problem sheet:'),
                $m->problem_sheet_selector('problem_sheet_id',$s->problem_sheet_id));
  }

  if ($m->lecture_sessions) {
   echo $H->row($H->bold('Lecture:'),
                $m->lecture_session_selector('session_id',$s->session_id));
  }
  
  echo $H->row($H->bold('Code:'),
               $H->text_input('code',$s->code,array('size' => 10)));
  echo $H->row('',$explain_code);
  echo $H->row($H->bold('Title:'),
               $H->text_input('title',$s->title,array('size' => 60)));
  echo $H->row($H->bold('Judgemental:'),
               $H->checkbox('is_judgemental',
                            $s->is_judgemental,
                            array('id' => 'is_judgemental_cb')));
  echo $H->row('',$explain_judgemental);
  echo $H->row($H->bold('Multiple:'),
               $H->checkbox('is_multiple',
                            $s->is_multiple));
  echo $H->row('',$explain_multiple);
  
  echo $H->edged_table_end();

  echo <<<HTML
<h2>Introduction</h2>
<br/>

HTML
   ;

  echo $H->textarea('intro',$s->intro,array('cols' => 95));

  echo <<<HTML
<br/>
<button type="button" id="intro_preview_button">Preview</button>
<br/><br/>
<div id="intro_display">
{$s->intro}
</div>

HTML;

  echo <<<HTML
<h2>Solution</h2>
<br/>

HTML
   ;

  echo $H->textarea('solution',$s->solution,array('cols' => 95));

  echo <<<HTML
<br/>
<button type="button" id="solution_preview_button">Preview</button>
<br/><br/>
<div id="solution_display">
{$s->solution}
</div>

HTML;

  echo <<<HTML
<br/>
<input type="hidden" name="items" value=""/>
<input type="hidden" name="deletions" value=""/>

HTML
   ;

  if ($s->id) {
   echo <<<HTML
<div id="items_div">
</div>
<br/>
<button id="add_item_button" class="add_item_button" type="button">
Add an item
</button>
HTML
    ;
  } else {
   echo <<<HTML
<div>
You need to save this poll before you can add any items to it.
</div>

HTML
    ;
  }

  $this->edit_page_footer();
 }

 function display_page_widgets() {
  return array('mathjax');
 }

 function display_page_scripts() {
  return array('poll_display');
 }
 
 function display_page_onload() {
  $id = $this->object->id;
  if (! $id) { $id = 0; }
  return "sangaku.poll_display.init($id)";
 }

 function display_page() {
  global $sangaku;
  
  $s = $this->object;
  $m = $s->load_link('module');
 
  $this->display_page_header();

  echo $sangaku->nav->top_menu();
  
  echo <<<HTML
<br/>
<div id="poll_div"></div>

HTML
;
  $this->display_page_footer();
 }

 function handle_command() {
  if ($this->command == 'create_instances') {
   $this->load_from_database();
   $this->object->create_instances(true);
   $this->show_instances_page();
  }
 }

 function show_instances_page() {
  global $sangaku;
  $N = $sangaku->nav;
  $H = $sangaku->html;

  $N->header('Instances',array('widgets' => array('mathjax')));
  $s = $this->object;
  $s->load();
  $s->load_instances();
  
  $u = $this->listing_url();
  $v = '/sangaku/poll_info.php?id=' . $s->id . '&command=';

  echo $N->top_menu();
  
  echo <<<HTML
<h1>Instances for:<br/> {$s->descriptor()}</h1>
<br/>
<table>
 <tr>
  <td id="load_td" class="command" width="100" onclick="location='{$v}load';">Edit</td>
  <td id="load_td" class="command" width="100" onclick="location='{$v}display';">View</td>
  <td id="listing_td" class="command" width="100" onclick="location='$u';">Index</td>
 </tr>
</table>
<br/>

HTML
   ;

  echo $H->edged_table_start();
  echo $H->spacer_row(30,60,180);
  echo $H->row('id','Group','Time');
  foreach($s->instances as $x) {
   echo $H->tr($H->td($x->id) .
               $H->td($x->tutorial_group_name) .
               $H->td($x->friendly_start_time())
   );
  }
  
  echo $H->edged_table_end();
  
  $N->footer();
 }
}

(new poll_editor())->run();
