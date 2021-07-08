<?php

require_once('../vendor/autoload.php');
require_once('../include/sangaku.inc');
require_once($sangaku->frog_dir . '/googler.inc');

$goog = new frog_googler();
$goog->log_file = $sangaku->data_dir . '/google/log.txt';
$goog->credentials_dir = $sangaku->data_dir . '/google';
$goog->auth_uris['gmail'] = 'https://' . $_SERVER['HTTP_HOST'] .
                                '/sangaku/admin/gmail_setup_tokens.php';
$key = 'gmail';

$client = $goog->get_client($key);

$code = get_optional_parameter('code','');
$error = get_optional_parameter('error','');
$go = get_optional_parameter('go',0) ? 1 : 0;

if ($code) {
 $goog->handle_auth_code($key,$code);
} else if ($error) {
 $goog->handle_auth_error($key,$error);
} else if ($go) {
 $goog->redirect_to_authorise($key);
} else {
 show_help_page($goog);
}
exit;

//////////////////////////////////////////////////////////////////////

function show_help_page($goog) {
 global $sangaku;
 
 $access_token_file  = $goog->credentials_dir . '/gmail_access_token.json';
 $refresh_token_file = $goog->credentials_dir . '/gmail_refresh_token.txt';

 if (file_exists($access_token_file)) {
  $access_token_json = file_get_contents($access_token_file);
  $access_token_arr  = json_decode($token_json,true);
  $access_token = $access_token_arr['access_token'];
 } else {
  $access_token_json = '';
  $access_token_arr = array();
  $access_token = '';
 }

 if (file_exists($refresh_token_file)) {
  $refresh_token = file_get_contents($refresh_token_file);
 } else {
  $refresh_token = '';
 }

 $sangaku->nav->header('Gmail setup');

 echo <<<HTML
<h1>Google Gmail Token Setup</h1>

<div class="text">
Use this page to set up OAuth tokens for the Sangaku web pages
to use GMail.  In principle it should only be necessary to
use this page once.
</div>
<br/><br/>
<br/><br/>
Current values in the database:
<table class="edged">
 <tr>
  <td width="100">Refresh token:</td>
  <td width="600">$refresh_token</td>
 </tr>
 <tr>
  <td width="100">Access token:</td>
  <td width="600">$access_token</td>
 </tr>
</table>

<table>
<tr><td class="command" onclick="location='gmail_setup_tokens.php?go=1'">Go</td></tr>
</table>

HTML;
 
 $sangaku->nav->footer();
}


?>
