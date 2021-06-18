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

  if (isset($_REQUEST['status'])) {
   $status = $_REQUEST['status'];
   if ($status == 'teacher' || $status == 'student') {
    $this->status = $status;
   }
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

//////////////////////////////////////////////////////////////////////

class module_suggester extends frog_suggester {
 function __construct() {
  global $sangaku;
  $this->frog = $sangaku;
  $this->type = 'module';
  $this->table_name = 'tbl_modules x';
  $this->status = null;
  $this->moid = null;
  $this->descriptor_query = <<<SQL
SELECT  CONCAT(x.code,' (',x.title,')') 
FROM tbl_modules WHERE id=%s LIMIT 0,1
SQL
; }

 function get_suggestions() {
  $s = $this->search_term;
  $t = ''; $u = '';

  $n = 10;

  $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(x.code,' (',x.title,')') AS v
FROM {$this->table_name} $t
WHERE x.title LIKE '$s%' $u
ORDER BY x.code
LIMIT 0,10
SQL
  );

  if ($n) {
   $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(x.code,' (',x.title,')') AS v
FROM {$this->table_name} $t
WHERE x.code LIKE '$s%' $u
ORDER BY x.code
LIMIT 0,10
SQL
   );
  }
 }
}

//////////////////////////////////////////////////////////////////////

class tutorial_group_suggester extends frog_suggester {
 function __construct() {
  global $sangaku;
  $this->frog = $sangaku;
  $this->type = 'tutorial_group';
  $this->table_name = 'tbl_tutorial_groups x';
  $this->module_id = null;
  $this->descriptor_query = <<<SQL
SELECT CONCAT(m.code, ' (',x.name,')') 
FROM tbl_tutorial_groups x LEFT JOIN tbl_modules m ON x.module_id=m.id
WHERE id=%s LIMIT 0,1
SQL
; }

 function get_extra_params() {
  if (isset($_REQUEST['module_id'])) {
   $this->module_id = (int) $_REQUEST['module_id'];
  } else {
   $this->module_id = null;
  }

  if ($this->module_id) {
   $this->descriptor_query = <<<SQL
SELECT x.name
FROM tbl_tutorial_groups x 
WHERE module_id={$this->module_id} AND id=%s LIMIT 0,1
SQL
   ;
  }
 }

 function get_suggestions() {
  $s = $this->search_term;
  $t = ''; $u = '';

  if ($this->module_id) {
   $u .= " AND x.module_id='{$this->module_id}'";
  }

  $i = strpos($s,"(");
  $n = 10;
  
  if ($this->module_id) {
   $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 x.name AS v
FROM {$this->table_name} $t
WHERE name LIKE '$s%' $u
ORDER BY x.name
LIMIT 0,10
SQL
);
  } else { // no module specified
   if ($i === FALSE) {
    $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(m.code,' (',x.name,')') AS v
FROM tbl_tutorial_groups x
LEFT JOIN tbl_modules m ON x.module_id=m.id
WHERE m.code LIKE '$s%' $u
ORDER BY x.name
LIMIT 0,10
SQL
    );

    if ($n > 0) {
     $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(m.code,' (',x.name,')') AS v
FROM tbl_tutorial_groups x
LEFT JOIN tbl_modules m ON x.module_id=m.id
WHERE x.name LIKE '$s%' $u
ORDER BY x.name
LIMIT 0,10
SQL
     );
    }
   } else {
    $c = trim(substr($s,0,$i));
    $d = trim(substr($s,$i)," ()");

     $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(m.code,' (',x.name,')') AS v
FROM tbl_tutorial_groups x
LEFT JOIN tbl_modules m ON x.module_id=m.id
WHERE m.code='$c' AND x.name LIKE '$d%' $u
ORDER BY x.name
LIMIT 0,10
SQL
     );
   }
  }
 }
}

//////////////////////////////////////////////////////////////////////

class problem_sheet_suggester extends frog_suggester {
 function __construct() {
  global $sangaku;
  $this->frog = $sangaku;
  $this->type = 'problem_sheet';
  $this->table_name = 'tbl_problem_sheets x';
  $this->module_id = null;
  $this->descriptor_query = <<<SQL
SELECT CONCAT(m.code,':',x.code,' (',x.title,')') 
FROM tbl_problem_sheets x LEFT JOIN tbl_modules m ON x.module_id=m.id
WHERE id=%s LIMIT 0,1
SQL
; }

 function get_extra_params() {
  if (isset($_REQUEST['module_id'])) {
   $this->module_id = (int) $_REQUEST['module_id'];
  } else {
   $this->module_id = null;
  }

  if ($this->module_id) {
   $this->descriptor_query = <<<SQL
SELECT CONCAT(x.code,' (',x.title,')')
FROM tbl_problem_sheets x 
WHERE module_id={$this->module_id} AND id=%s LIMIT 0,1
SQL
   ;
  }
 }

 function get_suggestions() {
  $s = $this->search_term;
  $t = ''; $u = '';
  
  if ($this->module_id) {
   $u .= " AND x.module_id='{$this->module_id}'";
  }
  
  $i = strpos($s,":");
  $n = 10;
  
  if ($this->module_id) {
   $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(x.code,' (',x.title,')') AS v
FROM {$this->table_name} $t
WHERE code LIKE '$s%' $u
ORDER BY x.code
LIMIT 0,10
SQL
   );
   
   if ($n > 0) {
    $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(x.code,' (',x.title,')') AS v
FROM {$this->table_name} $t
WHERE x.title LIKE '$s%' $u
ORDER BY x.code
LIMIT 0,10
SQL
    );
   }
  } elseif ($i === FALSE) {
   $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(m.code,':',x.code,' (',x.title,')') AS v
FROM tbl_problem_sheets x
LEFT JOIN tbl_modules m ON x.module_id=m.id
WHERE m.code LIKE '$s%' $u
ORDER BY m.code,x.code
LIMIT 0,10
SQL
   );
   
   if ($n > 0) {
    $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(m.code,':',x.code,' (',x.title,')') AS v
FROM tbl_problem_sheets x
LEFT JOIN tbl_modules m ON x.module_id=m.id
WHERE x.code LIKE '$s%' $u
ORDER BY m.code,x.code
LIMIT 0,10
SQL
    );
   }
   
   if ($n > 0) {
    $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(m.code,':',x.code,' (',x.title,')') AS v
FROM tbl_problem_sheets x
LEFT JOIN tbl_modules m ON x.module_id=m.id
WHERE x.title LIKE '$s%' $u
ORDER BY m.code,x.code
LIMIT 0,10
SQL
    );
   }
  } else {
   $c = trim(substr($s,0,$i));
   $d = trim(substr($s,$i)," :");
   
   $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(m.code,':',x.code,' (',x.title,')') AS v
FROM tbl_problem_sheets x
LEFT JOIN tbl_modules m ON x.module_id=m.id
WHERE m.code='$c' AND x.code LIKE '$d%' $u
ORDER BY x.code
LIMIT 0,10
SQL
   );
   
   if ($n > 0) {
    $n -= $this->add_suggestions(<<<SQL
SELECT
 x.id AS k,
 CONCAT(m.code,':',x.code,' (',x.title,')') AS v
FROM tbl_problem_sheets x
LEFT JOIN tbl_modules m ON x.module_id=m.id
WHERE x.title LIKE '$s%' $u
ORDER BY m.code,x.code
LIMIT 0,10
SQL
    );
    
   }
  }
 }
}
