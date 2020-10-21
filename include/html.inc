<?php

class sangaku_html extends frog_html {
 function __construct() {
  global $sangaku;

  parent::__construct($sangaku);

  $this->icons_url = '/sangaku/icons';
 }

 function student_selector($field_name,$id='',$opts=null) {
  $v = '';
  if ($id) {
   if (is_object($id)) {
    $p = $id;
   } else {
    $p = $this->frog->load('student',$id);
   }
   if ($p) {
    $v = $p->backwards_name;
   }
  }
  return $this->ajax_selector('student',$field_name,$id,$v,$opts);
 }
}
