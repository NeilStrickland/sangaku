<?php

class array_renderer extends PhpLatex_Renderer_Abstract {

 public function render($document) {
  if (!$document instanceof PhpLatex_Node) {
   $document = $this->getParser()->parse($document);
  }

  return $this->process_node($document);
 }

 function process_node($node) {
  $c = array();
  foreach($node->getChildren() as $n) {
   $c[] = $this->process_node($n);
  }
  return array($node->getType(),$node->getProps(),$c);
 }
}


class sangaku_renderer extends PhpLatex_Renderer_Abstract {
 static $item_environments = array(
  'question' => 1,
  'problem' => 1,
  'part' => 2,
  'subpart' => 3,
  'subquestion' => 2,
  'subsubquestion' => 3
 );

 static $item_labels = array(
  array(),
  array(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20),
  array('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'),
  array('(i)','(ii)','(iii)','(iv)','(v)','(vi)','(vii)','(viii)','(ix)','(x)')
 );
 
 public function render($document) {
  if (!$document instanceof PhpLatex_Node) {
   $document = $this->getParser()->parse($document);
  }

  $this->document = $document;
  $this->base_item = new stdClass();
  $this->base_item->depth = 0;
  $this->base_item->intro = '';
  $this->base_item->state = 'not started';
  $this->base_item->children = array();

  foreach($document->getChildren() as $node) {
   $this->process_node($node,$this->base_item);
  }

  return $this->base_item;
 }

 function process_node($node,$item) {
  if ($node->getType() == 'command') {
   $v = $node->value;
   if ($v  == "\\par") {
    $t = 'whitespace';
   } elseif (isset(sangaku_renderer::$item_environments[$v])) {
    $t = 'item environment';
   }
  }

  if ($item->state == 'not started') {
   if ($t == 'whitespace') {
    // ignore
   } elseif ($t == 'itemize environment') {
    $item->children = array();
    $C = $node->getChildren();
    foreach
   }
   $item->intro .= PhpLatex_Renderer_Abstract::toLatex($node);
  } elseif ($item->state == 'started itemize') {
  } elseif ($item->state == 'started env') {
  } else {
  }
 }
}
