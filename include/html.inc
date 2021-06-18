<?php

class sangaku_html extends frog_html {
 function __construct() {
  global $sangaku;

  parent::__construct($sangaku);

  $this->icons_url = '/sangaku/icons';
 }

 function user_selector($field_name,$id='',$opts=null) {
  $v = '';
  if ($id) {
   if (is_object($id)) {
    $p = $id;
   } else {
    $p = $this->frog->load('user',$id);
   }
   if ($p) {
    $v = $p->backwards_name;
   }
  }
  return $this->ajax_selector('user',$field_name,$id,$v,$opts);
 }

 function module_selector($field_name,$id='',$opts=null) {
  $v = '';
  if ($id) {
   if (is_object($id)) {
    $p = $id;
   } else {
    $p = $this->frog->load('module',$id);
   }
   if ($p) {
    $v = $p->descriptor();
   }
  }

  return $this->ajax_selector('module',$field_name,$id,$v,$opts);
 }

 function tutorial_group_selector($field_name,$id='',$opts=null) {
  $v = '';
  if ($id) {
   if (is_object($id)) {
    $p = $id;
   } else {
    $p = $this->frog->load('tutorial_group',$id);
   }
   if ($p) {
    if ($opts && isset($opts['module_id']) && $opts['module_id']) {
     $v = $p->module_descriptor();
    } else {
     $v = $p->descriptor();
    }
   }
  }

  return $this->ajax_selector('tutorial_group',$field_name,$id,$v,$opts);
 }

 function problem_sheet_selector($field_name,$id='',$opts=null) {
  $v = '';
  if ($id) {
   if (is_object($id)) {
    $p = $id;
   } else {
    $p = $this->frog->load('problem_sheet',$id);
   }
   if ($p) {
    if ($opts && isset($opts['module_id']) && $opts['module_id']) {
     $v = $p->module_descriptor();
    } else {
     $v = $p->descriptor();
    }
   }
  }

  return $this->ajax_selector('problem_sheet',$field_name,$id,$v,$opts);
 }
}
