<?php

require_once('include/sangaku.inc');

$sangaku->nav->header(
 'Choose student',
 array('widgets' => array('autosuggest'))                     
);

echo $sangaku->nav->top_menu();

echo <<<HTML
<h1>Choose student</h1>
<br/><br/>
<form name="main_form" action="user_info.php" method="GET">
<input type="hidden" name="command" value="load"/>

HTML;

 echo $sangaku->html->student_selector('id');

echo <<<HTML
<br/>
<br/>
You can enter <tt>Smith,John</tt> or <tt>John Smith</tt> or
<tt>pma19js</tt> or <tt>JSmith4</tt>.
<br/>
<br/> 
<table><tr>
 <td class="command" onclick="document.main_form.submit()">Go</td>
</tr></table>
</form>

HTML;

$sangaku->nav->footer();
