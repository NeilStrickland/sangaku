<?php

require_once('../include/sangaku.inc');

if (! $user->is_admin) { exit; }

header('Content-Type: text/plain');

$js = $sangaku->javascript_declaration();

$js .= <<<JS
sangaku.statuses=[
    {"id":0,
     "code":"not_started",
     "icon":" ",
     "text":"I have not looked at this yet",
     "tutor_text":"Not started",
     "message":"",
     "action":""},
    {"id":1,"code":"current",
     "icon":"\u2699\ufe0f",
     "text":"I am working on this",
     "tutor_text":"Working on it",
     "message":"",
     "action":""},
    {"id":2,
     "code":"finished",
     "icon":"\u2705",
     "text":"I have finished and am happy with my answer",
     "tutor_text":"Finished",
     "message":"",
     "action":"step"},
    {"id":3,
     "code":"to_check",
     "icon":"\u2753",
     "text":"I have finished and want to check my answer",
     "tutor_text":"Finished, wants check",
     "message":"The teacher will see that you have asked for a check, and will talk to you when they can.",
     "action":"step"},
    {"id":4,
     "code":"stuck",
     "icon":"\u274c",
     "text":"I am stuck and would like some help",
     "tutor_text":"Wants help",
     "message":"The teacher will see that you have asked for help, and will talk to you when they can.",
     "action":""},
    {"id":5,
     "code":"move",
     "icon":"\u2b55",
     "text":"I am stuck and just want to move on",
     "tutor_text":"Got stuck and skipped",
     "message":"",
     "action":"step"},
    {"id":6,
     "code":"defer",
     "icon":"\u23e9",
     "text":"I want to skip this and try the next question",
     "tutor_text":"Skipped",
     "message":"",
     "action":"step"},
    {"id":7,
     "code":"responded",
     "icon":"\u27b0",
     "text":"Please read the teacher's response, then choose another status",
     "tutor_text":"Response entered",
     "message":null,
     "action":null}
].map(function(x) {
return Object.assign(Object.create(sangaku.status),x);
});

JS;

file_put_contents(__DIR__ . '/../js/objects_auto.js',$js);

echo <<<TEXT
Javascript saved to objects_auto.js:

$js
TEXT;

