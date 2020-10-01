<?php

require_once('../include/sangaku.inc');

$upload_id = (int) get_optional_parameter('upload_id',0);
if (! $upload_id) { exit; }
$upload = $sangaku->load('upload',$upload_id);
if (! $upload) { exit; }

header('Content-Type: ' . $upload->mime_type);
header('Content-Disposition: inline; filename=' . $upload->file_name());

readfile($upload->full_file_name());
