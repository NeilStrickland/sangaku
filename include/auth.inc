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
  $this->ldap_server = 'auth.shef.ac.uk';
  $this->ldap_base_dn = 'ou=Users,dc=sheffield,dc=ac,dc=uk';
  $this->login_log_file = $sangaku->login_log_file;
 }

 function check_password($params) {
  global $sangaku;

  $u = $params->user;

  $x = $this->ldap_check_password($u->username,$params->password);
  if ($x->ok) { return $x; }

  $y = $this->ldap_check_password($u->username,$params->password);
  if ($y->ok) {
   return $y;
  } else {
   return $x;
  }
 }
}

?>
