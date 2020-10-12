<?php

require_once('include/sangaku.inc');
require_once('include/imap_extra.inc');

$f = $sangaku->data_dir . '/imap_cred.json';
if (! file_exists($f)) { exit; }
$imap_cred = json_decode(file_get_contents($f));
if (! $imap_cred && isset($imap_cred->username) && isset($imap_cred->password)) { exit; }
                         
$imap = imap_open(
 '{imap.gmail.com:993/imap/ssl}INBOX',
 $imap_cred->username,
 $imap_cred->password
);
if (! $imap) { exit; }

$ids = imap_search($imap, 'SUBJECT "Sangaku"');

foreach($ids as $id) {
 handle_message($imap,$id);
}

exit;

function handle_message($imap,$id) {
 global $sangaku, $user;
 
 $x = new stdClass();
 $x->id = $id;

 $m = mail_mime_to_array($imap,$id,1);
 $h = $m[0]['parsed'];
 $x->from = $h['From'];
 if (preg_match("/<([A-Za-z0-9.]*)@sheffield.ac.uk>$/",$x->from,$u)) {
  $x->gmail_name = $u[1];
 } else {
  $x->gmail_name = '';
 }
 $x->date = $h['Date'];
 $x->timestamp = strtotime($x->date);
 $x->subject = $h['Subject'];
 $x->spf = null; $x->dkim = null; $x->gdkim = null;
 if (isset($h['Received-SPF'])) { $x->spf = $h['Received-SPF']; }
 if (isset($h['DKIM-Signature'])) { $x->dkim = $h['DKIM-Signature']; }
 if (isset($h['X-Google-DKIM-Signature'])) { $x->gdkim = $h['X-Google-DKIM-Signature']; }
 $x->ok =
        $x->gmail_name &&
        ($x->spf && strlen($x->spf) >= 4 && substr($x->spf,0,4) == 'pass') &&
        $x->dkim &&
        $x->gdkim;

 $x->attachments = array();
 foreach ($m as $i => $p) {
  if (isset($p['is_attachment']) && $p['is_attachment']) {
   $x->attachments[] = $p;
  }
 }

 $ok = find_user($x) &&
       find_question_item($x) &&
       create_temp_file($x) &&
       add_upload($x);
 delete_email($x);

 return $ok;
}

function find_user($x) {
 global $sangaku;

 if (! $x->gmail_name) { return false; }
 
 $uu = $sangaku->load_where('users',"x.gmail_name='{$x->gmail_name}'");

 if (! $uu) { return false; }
 $x->sender = $u[0];
 $x->is_fake = 0;
 
 if ($x->sender->status == 'teacher' &&
     preg_match("/^Sangaku{([0-9]+)}(.*)$/i",$x->subject,$u)) {
  $x->is_fake = 1;
  $x->user_id = (int) $u[1];
  $x->subject = 'Sangaku' . $u[2];
  $x->user = $sangaku->load('user',$x->user_id);
  if (! ($x->user_id && $x->user)) { return false; }
 } else {
  $x->is_fake = 0;
  $x->user_id = $x->sender->id;
  $x->user = $x->sender;
 }
 return true;
}

function find_question_item($x) {
 if (preg_match("/^Sangaku(.*)$/i",$x->subject,$u)) {
  $x->item_id = (int) $u[1];
  $x->item = $sangaku->load('question_item',$x->item_id);
  if (! ($x->item_id && $x->item)) { return false; }
  $x->problem_sheet = $x->item->load_link('problem_sheet');
  $sessions = $sangaku->load_where('sessions',"x.problem_sheet_id={$x->problem_sheet->id}");
  $sessions1 = array();
  $sessions2 = array();
  $sessions3 = array();

  // UNFINISHED
  
  foreach($sessions as $s) {
   $right_group = ($s->tutorial_group_id == 
  }
 } else {
  $x->user->load_sessions();
 }
}
