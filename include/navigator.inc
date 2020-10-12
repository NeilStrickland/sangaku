<?php

class sangaku_navigator extends frog_navigator {
 function __construct() {
  global $sangaku;

  parent::__construct($sangaku);

  $this->frog_script_url = '/sangaku/js/frog.js';
   
  $this->index_url = '/sangaku/index.php';
  $this->base_url = '/sangaku';
  $this->scripts_base_url = '/sangaku/js';
  $this->styles_base_url  = '/sangaku/css';

  $this->scripts_base_dir = dirname(__DIR__) . '/js';
  $this->styles_base_dir  = dirname(__DIR__) . '/css';
  
  $this->standard_scripts = array('objects_auto','sangaku');
  $this->standard_styles  = array('sangaku');
 }

 function request_login_page($params = null) {
  $p = $params;
  if (! $p) {
   $p = new stdClass();
   $p->requested_url = '';
   $p->username = '';
   $p->login_error = '';
  }
  
  $script = <<<JS
<script type="text/javascript">

 function submit_enter(e) {
  var keycode;
  if (window.event) {
   keycode = window.event.keyCode;
  } else if (e) {
   keycode = e.which;
  } else {
   return true;
  }

  if (keycode == 13 && 
      document.login_form.username.value != '' &&
      document.login_form.password.value != '') {
   document.login_form.submit();
  } else {
   return true;
  }
 }

</script>

JS
          ;

 if ($p->requested_url) {
  $url = htmlentities($p->requested_url);
 } else {
  $url = 'https://' . $_SERVER['SERVER_NAME'] . 
   $_SERVER['REQUEST_URI'];
  $url = htmlentities($url);
 }

 $f = $this->frog;
 $action = $this->base_url . "/login.php";
 
 echo <<<HTML
{$this->dtd}
<html>
<head>
<title>Sangaku Login</title>
<style type="text/css" media="screen">
  @import url({$this->styles_base_url}/sangaku.css);
</style>

$script

</head>
<body>
<!-- <noscript>
Warning: you appear to have disabled Javascript.  These 
pages are heavily dependent on Javascript,
and many things will not work when Javascript is turned off.
</noscript> -->

<h1>Sangaku Login Page</h1>

HTML
  ;

 echo <<<HTML
<form name="login_form" method="POST" action="$action">
<input type="hidden" name="requested_url" value="$url"/>

<table>
 <tr>
  <td>User name</td>
  <td><input type="text" size="30" name="username" value="{$p->username}"
   onkeypress="return submit_enter(event)"/></td>
 </tr>
 <tr>
  <td>Password</td>
  <td><input type="password" size="30" name="password" value=""
   onkeypress="return submit_enter(event)"/></td>
 </tr>
 <tr>
  <td colspan="2" class="command" onclick="document.login_form.submit()">Submit</td>
 </tr>
</table>
<br/><br/>
<div class="text">
Use your usual University of Sheffield username (something 
like <code>sm1js</code>) and password.
</div>
</form>

HTML
  ;

 if ($p->login_error) {

  echo <<<HTML
<p style="width:600px">
 <span style="color: red">
 Your user name and password were not found.
 </span>
 <br/>
 All SoMaS staff and 
 postgraduates, and all students taking SoMaS modules,
 should be able to log in.  If you are in one of these categories, 
 and are sure that you have entered your user name and password 
 correctly, then you should contact Neil Strickland
 (<a href="mailto:N.P.Strickland@sheffield.ac.uk">N.P.Strickland@sheffield.ac.uk</a>).
</p>
<hr/>

HTML
   ;
 }

 echo <<<HTML
</body>
</html>

HTML
  ;
 
 }

 function top_menu() {
  global $user;
  
  $html = "<div class=\"topmenu\">";

  $html .= <<<HTML
<button type="button" onclick="location='/sangaku/logout.php'">Logout</button>
<button type="button" onclick="location='/sangaku/index.php'">Home</button>

HTML
        ;

  if ($user->status == 'teacher') {
  $html .= <<<HTML
<button type="button" onclick="location='/sangaku/module_list.php'">Modules</button>

HTML
        ;

  }
  $html .= "</div>";
  return $html;
 }

 function top_session_menu($session_id) {
  global $user;
  
  $html = "<div class=\"topmenu\">";

  $html .= <<<HTML
<button type="button" onclick="location='/sangaku/logout.php'">Logout</button>

HTML
        ;

  if ($user->status == 'teacher') {
  $html .= <<<HTML
<button type="button" onclick="location='/sangaku/module_list.php'">Modules</button>

HTML
        ;

  }

  $html .= <<<HTML
<button type="button" onclick="window.open('/sangaku/fake_students.php?session_id={$session_id}')">Fake students</button>

HTML
        ;
  
  $html .= "</div>";
  return $html;
 }
}
