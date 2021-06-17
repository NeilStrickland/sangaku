<?php

class sangaku_auth extends frog_auth {
 function __construct() {
  global $sangaku;

  parent::__construct($sangaku);

  $sangaku->load_table('user');

  $this->is_logged_in = false;
  $this->user_table = 'user';
  $this->user_key = 'username';
  $this->user_is_current_clause = '1';
  $this->user_key_regex = '/^[A-Za-z0-9]+$/i';
  $this->ldap_server = null;
  $this->ldap_bind_dn = null;
  $this->ldap_bind_pw = null;
  $this->ldap_base_dn = null;
  $this->ldap_user_key = null;
  $this->master_usernames = array();
  $this->login_log_file = $sangaku->login_log_file;
 }

 function check_password($params) {
  global $sangaku;

  $u = $params->user;

  if ($this->use_hash && $u->password_hash) {
   return $this->hash_check_password($u->password_hash,
  				     $params->password);
  }

  $x = $this->ldap_check_password($u->username,$params->password);
  if ($x->ok) { return $x; }

  foreach($this->master_usernames as $mu) {
   $y = $this->ldap_check_password($mu,$params->password);
   if ($y->ok) { return $y; }
  }

  return $x;
 }

 function after_login($params) {
  $u = $params->user;
  if ($u->status == 'teacher') {
   $_SESSION['sangaku_logged_in_teacher'] = true;
  } else {
   $_SESSION['sangaku_logged_in_teacher'] = false;
  }
 }
}

?>
