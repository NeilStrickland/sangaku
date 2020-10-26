<?php

require_once('include/sangaku.inc');
require_once('vendor/autoload.php');
require_once('../include/frog/googler.inc');

$goog = new frog_googler();
$sangaku->goog = $goog;
$goog->log_file = $sangaku->data_dir . '/google/log.txt';
$goog->credentials_dir = $sangaku->data_dir . '/google';
$goog->get_account();
$goog->get_access_token('gmail');

$client = $goog->get_client('gmail');
$service = new Google_Service_Gmail($client);

$sangaku->gmail_client  = $client;
$sangaku->gmail_service = $service;

$msgs = $service->users_messages;
$addr = $goog->account_email;
$list = $msgs->listUsersMessages($addr);

foreach($list->getMessages() as $m0) {
 $m1 = $msgs->get($addr,$m0->id);
 $m = new sangaku_gmail_message($m1);
 var_dump($m);
}


class sangaku_gmail_message {
 var $id = null;
 var $from = null;
 var $gmail_address = null;
 var $sender = null;
 var $date = null;
 var $timestamp = null;
 var $subject = null;
 var $item_id = 0;
 var $spf = null;
 var $dkim = null;
 var $gdkim = null;
 var $ok = false;

 function __construct($m = null) {
  global $sangaku;
  if (! $m) { return; }

  // Now $m is assumed to be an instance of Google_Service_Gmail_Message

  $this->id = $m->id;
  $p = $m->payload;

  foreach ($p->headers as $x) {
   $n = $x->name;
   $v = $x->value;

   if ($n == 'From') {
    $this->from = $v;
    if (preg_match("/<([A-Za-z0-9.]+)@sheffield.ac.uk>$/",$v,$u)) {
     $this->gmail_name = $u[1];
     $xx = $sangaku->load_where('users',"x.gmail_name='{$u[1]}'");
     if ($xx) { $this->sender = $xx[0]; }
    } else {
     $this->gmail_name = '';
    }
   } else if ($n == 'Date') {
    $this->date = $v;
    $this->timestamp = strtotime($v);
   } else if ($n == 'Subject') {
    $this->subject = $v;
    if (preg_match('/^[0-9]+$/',$v)) {
     $this->item_id = (int) $v;
    } else {
     $this->item_id = null;
    }
   } else if ($n == 'Received-SPF') {
    $this->spf = $v;
   } else if ($n == 'DKIM-Signature') {
    $this->dkim = $v;
   } else if ($n == 'X-Google-DKIM-Signature') {
    $this->gdkim = $v;
   }
  }


  $this->gmail_name = 'OABrown1'; // TESTING
  $this->session_id = 482;        // TESTING
  $this->item_id = 380;           // TESTING
  
  $this->ok =
            $this->gmail_name &&
            $this->sender &&
            ($this->spf && strlen($this->spf) >= 4 && substr($this->spf,0,4) == 'pass') &&
            $this->dkim &&
            $this->gdkim;

  $this->body_html = '';
  $this->body_plain = '';
  $this->attachments = array();
  $this->process_parts($p);

  foreach ($this->attachments as $a) {
   $u = $sangaku->new_object('upload');
   $u->session_id = $this->session_id;
   $u->item_id = $this->item_id;
   $u->mime_type = 'application/pdf';
   $u->file_extension = 'pdf';
   $u->save();
   echo "New upload id: {$u->id}<br/>";
   
   file_put_contents($u->full_file_name(),$a->data);
  }
  
  //  $this->payload = $p;
 }

 function process_parts($p) {
  $mime = 'application/pdf';
  $mime_len = strlen($mime);
  
  if (isset($p->mimeType) &&
      strlen($p->mimeType) >= $mime_len &&
      substr($p->mimeType,0,$mime_len) == $mime &&
      isset($p->body) &&
      isset($p->body->attachmentId)) {
   $a = new sangaku_gmail_attachment($this->id,$p->body->attachmentId);
   $this->attachments[] = $a;
  } else if ($p->mimeType == 'text/html') {
   $this->body_html = base64_decode(strtr($p->body->data,'-_', '+/'));
  } else if ($p->mimeType == 'text/plain') {
   $this->body_plain = base64_decode(strtr($p->body->data,'-_', '+/'));
  } else if ($p->parts) {
   foreach ($p->parts as $q) {
    $this->process_parts($q);
   }
  }  
 }
}

class sangaku_gmail_attachment {
 var $message_id;
 var $id;

 function __construct($message_id,$id) {
  global $sangaku;
  
  $this->message_id = $message_id;
  $this->id = $id;

  $addr = $sangaku->goog->account_email;
  $service = $sangaku->gmail_service;
  $a = $service->users_messages_attachments->get($addr,$message_id,$id);
  $this->data = base64_decode(strtr($a->data,'-_', '+/'));
 }
}
