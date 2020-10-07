<?php

class problem_sheet_editor extends object_editor {
 function __construct() {
  parent::__construct('problem_sheet');
 }

 function associated_lists() {
  return array(
   array('name' => 'question_item')
  );
 }

 function listing_url() {
  $s = $this->object;
  if ($s && $s->module_id) {
   return 'problem_sheet_list.php?module_id=' . s->module_id;
  } else {
   return 'problem_sheet_list.php';
  }
 }

 function edit_page_title() {
  $s = $this->object;
  return $s->module_code .
   ' (' . $m->module_title . ') ' .
   session_string($m->session);
 }

 function edit_page_widgets() {
  return(array('tabber','autosuggest','calendar'));
 }

}
