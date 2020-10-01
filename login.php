<?php

require_once('include/sangaku.inc');

global $sangaku;

$params = new stdClass();
$params->username      = get_optional_parameter('username','');
$params->password      = get_optional_parameter('password','');
$params->requested_url = get_optional_parameter('requested_url','');

$params->debug_login = true;

$sangaku->auth->handle_login($params);

?>
