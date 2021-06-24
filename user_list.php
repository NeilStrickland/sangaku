<?php

ini_set('display_errors',1);

require_once('include/sangaku.inc');

$sangaku->nav->header(
 'Choose student',
 array('widgets' => array('autosuggest'))                     
);

echo $sangaku->nav->top_menu();

echo <<<HTML
<h1>Choose user</h1>
<br/><br/>
<form name="main_form" action="user_info.php" method="GET">
<input type="hidden" name="command" value="load"/>

HTML;

 echo $sangaku->html->user_selector('id');

echo <<<HTML
<button type="button" onclick="document.main_form.submit()">Go</button>
<br/>
<br/>
You can enter <tt>Smith,John</tt> or <tt>John Smith</tt> or
<tt>pma19js</tt> or <tt>JSmith4</tt>.
<br/>
<br/>
<button type="button" onclick="sangaku.do_command('new')">Add a new user</button>
<button type="button" onclick="location='upload_users.php'">Upload a list of users</button>
</form>

HTML;

$sangaku->nav->footer();
