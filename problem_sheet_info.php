<?php

require_once('include/sangaku.inc');
 
class problem_sheet_editor extends frog_object_editor {
 function __construct() {
  global $sangaku;
  parent::__construct($sangaku,'problem_sheet');
 }

 function parent_table() {
  return 'module';
 }
 
 function associated_lists() {
  return array(
   array('name' => 'question_item')
  );
 }

 function listing_url() {
  $s = $this->object;
  if ($s && $s->module_id) {
   return 'problem_sheet_list.php?module_id=' . $s->module_id;
  } else {
   return 'problem_sheet_list.php';
  }
 }

 function edit_page_widgets() {
  return array('mathjax');
 }
 
 function edit_page_scripts() {
  return array('sheet_editor');
 }
 
 function edit_page_styles() {
  return array('sheet_editor');
 }
 
 function edit_page_onload() {
  $id = $this->object->id;
  if (! $id) { $id = 0; }
  return "sangaku.sheet_editor.init($id)";
 }
 
 function edit_page_command_bar() {
  $html = <<<HTML
<table>
 <tr>
  <td id="save_td" class="command" width="100" onclick="frog.do_command('save');">Save</td>
  <td id="load_td" class="command" width="100" onclick="frog.do_command('load');">Restore</td>
  <td id="load_td" class="command" width="100" onclick="frog.do_command('display');">View</td>

HTML;

  if (isset($this->commands['suggest_delete'])) {
   $html .= <<<HTML
  <td id="suggest_delete_td" class="command" width="100" onclick="frog.do_command('suggest_delete');">Delete</td>

HTML;
  }

  $u = $this->listing_url();
  if ($u) {
   $html .= <<<HTML
  <td id="listing_td" class="command" width="100" onclick="location='$u';">Index</td>

HTML;
  }

  $html .= <<<HTML
 </tr>
</table>

HTML;

  return $html;
 }

 function display_page_widgets() {
  return array('mathjax');
 }

 function load_from_database() {
  $ok = parent::load_from_database();
  if ($ok) { $this->object->load_question_items(); }
  return $ok;
 }

 function load_associated_lists_from_request() {
  global $sangaku;

  $container = get_optional_parameter('container','');
  if (! $container) { return null; }

  $container = json_decode($container);
  $deletions = json_decode(get_required_parameter('deletions'));
  $this->items_by_id = array();
  $this->items_by_alt_id = array();
  $this->build_tree($container);

  foreach($this->items_by_alt_id as $aid => $item) {
   if ($item->parent_alt_id && isset($this->items_by_alt_id[$item->parent_alt_id])) {
    $p = $this->items_by_alt_id[$item->parent_alt_id];
    if ($item->parent_id != $p->id) {
     $item->parent_id = $p->id;
     $item->save();
     $item->load();
    }
   }
  }

  foreach($deletions as $id) {
   $item = $sangaku->delete('question_item',$id);
  }

  $this->object->load_question_items();
 }

 function build_tree($item0) {
  global $sangaku;
  
  foreach($item0->children as $child0) {
   $child = $sangaku->new_object('question_item');
   $keys = array(
    'id','alt_id','problem_sheet_id',
    'parent_id','parent_alt_id','position',
    'header','title','level','is_bottom',
    'problem','solution'
   );

   foreach($keys as $k) {
    $child->$k = $child0->$k;
   }

   $child->save();
   $child->load();
   $this->items_by_id[$child->id] = $child;
   $this->items_by_alt_id[$child->alt_id] = $child;
   $this->build_tree($child0);
  }
 }
 
 function edit_page() {
  global $sangaku;
  
  $H = $sangaku->html;
  $N = $sangaku->nav;
  $s = $this->object;
  $m = $s->load_link('module');

  $modules = $sangaku->load_all('modules');
  $module_opts = array();
  foreach ($modules as $x) {
   $x0 = new stdClass();
   $x0->id = $x->id;
   $x0->display = $x->code . ' (' . $x->title . ')';
   $module_opts[] = $x0;
  }
  
  $module_selector = $H->selector(
   'module_id',
   $module_opts,
   $s->module_id,
   array('mode' => 'indirect','index' => 'id','display' => 'display')
  );
  
  $this->edit_page_header();

  echo $N->top_menu();
  
  echo $H->edged_table_start();
  echo $H->spacer_row(120,500);
  echo $H->row($H->bold('Module:'),$module_selector);
  echo $H->row($H->bold('Semester:'),$H->semester_selector('semester',$s->semester));
  echo $H->row($H->bold('Week number:'),$H->week_number_selector('week_number',$s->week_number));
  echo $H->row($H->bold('Code:'),$H->text_input('code',$s->code));
  $code_instructions = <<<HTML
Here you should enter a short string that identifies this problem sheet.
For example, you could enter <code>S1W04</code> for a problem sheet 
in Week 4 of Semester 1, or <code>HW3</code> for the third homework 
assignment.
HTML
 ;
  echo $H->tr($H->td($code_instructions,null,array('colspan' => 2)));

  echo $H->row($H->bold('Title:'),$H->text_input('code',$s->code,array('size' => 60)));

  $title_instructions = <<<HTML
Here you can enter a longer and more descriptive title for this 
problem sheet.

HTML
 ;
  echo $H->tr($H->td($title_instructions,null,array('colspan' => 2)));

  echo $H->edged_table_end();

  echo <<<HTML
<h2>Introduction</h2>
<br/>

HTML
   ;

  echo $H->textarea('intro',$s->intro,array('cols' => 95));

  echo <<<HTML
<br/>
<button type="button" id="preview_button">Preview</button>
<br/><br/>
<div id="intro_display">
{$s->intro}
</div>
<br/>
<input type="hidden" name="container" value=""/>
<input type="hidden" name="deletions" value=""/>

HTML
   ;

  if ($s->id) {
   echo <<<HTML
<div id="questions_div">
</div>
HTML
    ;
  } else {
   echo <<<HTML
<div>
You need to save this problem sheet before you can add any questions to it.
</div>

HTML
    ;
  }
 }

 function display_page() {
  global $sangaku;
  
  $H = $sangaku->html;
  $s = $this->object;
  $m = $s->load_link('module');
 
  $this->display_page_header();

  $ss = $s->semester ? 'Semester ' . $s->semester : '';
  $ws = $s->week_number ? 'Week ' . $s->week_number : '';
 
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

HTML
   ;

  foreach($s->question_items as $i) {
   if ($i->level > 1) { continue; }
   echo "<li><span class=\"item_header\">{$i->titled_header()}: </span>";
   if (trim($i->problem)) {
    echo "<span class=\"problem\">{$i->problem}</span><br/>";
   }

   if ($i->children) {
    echo "<ul>";
    foreach ($i->children as $j) {
     echo "<li><span class=\"item_header\">{$j->titled_header()}: </span>";
     if (trim($j->problem)) {
      echo "<span class=\"problem\">{$j->problem}</span><br/>";
     }
    
     if ($j->children) {
      echo "<ul>";
      foreach ($j->children as $k) {
       echo "<li><span class=\"item_header\">{$k->titled_header()}: </span>";
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

HTML
   ;

  $this->display_page_footer();
 }
}

(new problem_sheet_editor())->run();
