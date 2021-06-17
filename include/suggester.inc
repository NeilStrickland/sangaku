<?php

class user_suggester extends frog_suggester {
 function __construct() {
  global $sangaku;
  $this->frog = $sangaku;
  $this->type = 'user';
  $this->table_name = 'tbl_users x';
  $this->status = null;
  $this->moid = null;
  $this->descriptor_query = <<<SQL
SELECT CONCAT(surname,', ',forename,' (',username,')') 
FROM tbl_users WHERE id=%s LIMIT 0,1
SQL
; }

 function get_extra_params() {
  if (isset($_REQUEST['moid'])) {
   $this->moid = (int) $_REQUEST['moid'];
  } else {
   $this->moid = 0;
  }
 }

 function get_suggestions() {
  $s = $this->search_term;
  $t = ''; $u = '';

  if ($this->status) {
   $u .= " AND x.status='{$this->status}'";
  }
  
  if ($this->moid) {
   $t .= " JOIN tbl_registrations y ON x.id=y.user_id";
   $u .= " AND y.module_occurrence_id={$this->moid}";
  }

  if (! (strpos($s,',') === FALSE)) {
   // Interpret as surname, forename
   $sf = explode(',',$s);
   $sn = trim($sf[0]);
   $fn = trim($sf[1]);
  
   $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(surname,', ',forename,' (',username,')') AS v
FROM {$this->table_name} $t
WHERE surname='$sn' AND forename LIKE '$fn%' $u
ORDER BY surname,forename
LIMIT 0,10
SQL
);

  } elseif (! (strpos($s,' ') === FALSE)) {
   // Interpret as forename surname
   $fs = explode(' ',$s);
   $fn = trim($fs[0]);
   $sn = trim($fs[1]);

   $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(surname,', ',forename,' (',username,')') AS v
FROM {$this->table_name} $t
WHERE surname LIKE '$sn%' AND forename='$fn' $u
ORDER BY forename,surname
LIMIT 0,10
SQL
);
  } else {
   $n = 10;

   if ($n) {
    $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(surname,', ',forename,' (',username,')') AS v
FROM {$this->table_name} $t
WHERE surname LIKE '$s%' $u
ORDER BY surname
LIMIT 0,$n
SQL
);
   }

   if ($n) {
    $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(surname,', ',forename,' (',username,')') AS v
FROM {$this->table_name} $t
WHERE forename LIKE '$s%' $u
ORDER BY forename
LIMIT 0,$n
SQL
);
   }

   if ($n) {
    $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(surname,' ',forename,' (',gmail_name,')') AS v
FROM {$this->table_name} $t
WHERE gmail_name LIKE '$s%' $u
ORDER BY gmail_name
LIMIT 0,10
SQL
);
   }

   if ($n) {
    $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(surname,' ',forename,' (',email_address,')') AS v
FROM {$this->table_name} $t
WHERE email_address LIKE '$s%' $u
ORDER BY email_address
LIMIT 0,10
SQL
);
   }

   if ($n) {
    $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(surname,' ',forename,' (',username,')') AS v
FROM {$this->table_name} $t
WHERE username LIKE '$s%' $u
ORDER BY username
LIMIT 0,10
SQL
);
   }
  }
 }
}
