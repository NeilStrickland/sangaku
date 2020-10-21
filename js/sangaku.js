sangaku.ajax_url = '/sangaku/ajax';
sangaku.object.ajax_url = sangaku.ajax_url;

sangaku.statuses_by_code = {};

for (x of sangaku.statuses) {
 sangaku.statuses_by_code[x.code] = x;
}

sangaku.work_icon = '📝';

sangaku.timestamp_to_hm = function(s) {
 if (s) {
  var d = new Date(s);
  var t = d.toString();
  var u = t.substring(16,24);
  return u;
 } else {
  return '';
 }
}

//////////////////////////////////////////////////////////////////////

sangaku.toggle_session_confirmed = function(session_id) {
 var cb = document.getElementById('session_confirmed_' + session_id);
 var s = Object.create(this.session);
 s.id = session_id;
 s.is_confirmed = cb.checked ? 1 : 0;
 s.save();
};

//////////////////////////////////////////////////////////////////////

sangaku.module.munch = function(x) {
 for (var k of ['id','code','title']) {
  if (k in x) { this[k] = x[k]; }
 }

 if (x.tutorial_groups) {
  this.tutorial_groups = [];
  for (y of x.tutorial_groups) {
   this.tutorial_groups.push(sangaku.tutorial_group.scrunch(y));
  }
 }
 
 if (x.problem_sheets) {
  this.problem_sheets = [];
  for (y of x.problem_sheets) {
   this.problem_sheets.push(sangaku.problem_sheet.scrunch(y));
  }
 }
 
 if (x.sessions) {
  this.sessions = [];
  for (y of x.sessions) {
   this.sessions.push(sangaku.session.scrunch(y));
  }
 } 
};

//////////////////////////////////////////////////////////////////////

sangaku.problem_sheet.munch = function(x) {
 for (var k of ['id','module_id','title','intro','latex_source']) {
  if (k in x) { this[k] = x[k]; }
 }

 if (x.module) {
  this.module = sangaku.module.scrunch(x.module);
 }

 this.question_items = [];
 this.question_items_by_id = {};
 this.top_items = [];
 this.bottom_items = [];
 this.bottom_items_by_id = {};

 if (x.question_items) { 
  for (y of x.question_items) {
   var item = sangaku.question_item.scrunch(y);
   item.children = [];
   item.item_index = this.question_items.length;
   this.question_items.push(item);
   this.question_items_by_id[item.id] = item;
   if (item.is_bottom) {
    item.bottom_index = this.bottom_items.length;
    this.bottom_items.push(item);
    this.bottom_items_by_id[item.id] = item;
   }

   if (item.level == 1) {
    this.top_items.push(item);
   }

   if (item.parent_id && this.question_items_by_id[item.parent_id]) {
    item.parent = this.question_items_by_id[item.parent_id];
    item.parent.children.push(item);
   }
  }
 }
};

sangaku.problem_sheet.set_stage = function(s) {
 var s0 = s;
 if (s0 < 0) { s0 = 0; }
 if (s0 >= this.bottom_items.length) {
  s0 = this.bottom_items.length - 1;
 }

 this.stage = s0;
 var x = this.bottom_items[s0];
 var i = x.item_index;

 for (j in this.items) {
  var y = this.items[j];
  if (j <= i) {
   y.div.style.display = 'block';
  } else {
   y.div.style.display = 'none';
  }
 }

 if (x.stepper.status.code == 'not_started') {
  x.stepper.handle_click(1);
 }
};

sangaku.problem_sheet.step_forward = function() {
 this.set_stage(this.stage + 1);
 var x = this.bottom_items[this.stage];
 x.stepper.handle_click(1);
};

sangaku.problem_sheet.step_backward = function() {
 this.set_stage(this.stage - 1);
};

sangaku.problem_sheet.stepper = {};

sangaku.problem_sheet.create_stepper = function(item) {
 var x = Object.create(this.stepper);

 x.parent = this;
 x.session_id = this.session_id;
 x.student_id = this.student_id;
 x.item_id = item.id;
 
 x.stage = item.bottom_index;
 x.status = item.statuses_by_code['not_started'];
 x.menu_open = false;
 
 x.container_div = document.createElement('div');
 x.container_div.className = 'stepper_container';
 item.control_div.appendChild(x.container_div);

 x.container_div.onmouseout = function() { x.handle_mouseout(); };
 
 x.option_divs = [];
 
 for (var i in sangaku.question_item.statuses) {
  var y = sangaku.question_item.statuses[i];
  var d = document.createElement('div');
  d.className = (y.code == 'responded') ? 'stepper_option_responded' : 'stepper_option';
  d.innerHTML = y.text;
  d.style.display = (i == 0) ? 'block' : 'none';
  d.peer = y;
  x.option_divs.push(d);
  x.container_div.appendChild(d);
  x.set_handlers(d);
 }
 return(x);
};

sangaku.problem_sheet.stepper.set_handlers = function(d) {
 var i = d.peer.id;
 var me = this;
 
 d.onmouseover = function() { me.handle_mouseover(i); }
 d.onclick = function() { me.handle_click(i); }
};

sangaku.problem_sheet.stepper.handle_mouseover = function(i) {
 this.menu_open = true;

 for (j in this.option_divs) {
  var d = this.option_divs[j];
  if (d.peer.code == 'responded') {
   d.className = (d.peer.id == i) ? 'stepper_option_active' : 'stepper_option_responded';
   d.style.display = (d.peer.id == i) ? 'block' : 'none';
  } else {
   d.className = (d.peer.id == i) ? 'stepper_option_active' : 'stepper_option';
   d.style.display = 'block';
  }
 }
};

sangaku.problem_sheet.stepper.handle_click = function(i) {
 this.menu_open = false;

 var extra = [];
 var found = false;
 var c = this.container_div;
 
 for (j in this.option_divs) {
  var d = this.option_divs[j];
  d.className = 'stepper_option'

  if (found) {
   d.style.display = 'none';
  } else if (d.peer.id == i) {
   d.style.display = 'block';
   found = true;
   this.status = d.peer;
   if (d.peer.action == 'step') {
    this.parent.set_stage(Math.max(this.parent.stage,this.stage + 1));
   }
  } else {
   d.style.display = 'none';
   c.removeChild(d);
   extra.push(d);
  }
 }

 for (j in extra) {
  c.appendChild(extra[j]);
 }

 var url = '/sangaku/ajax/record_status.php' +
     '?item_id=' + this.item_id +
     '&student_id=' + this.student_id +
     '&status_id=' + i;
 
 var xhr = frog.create_xhr();
 xhr.open('GET',url,false);
 xhr.send(null);
};

sangaku.problem_sheet.stepper.handle_mouseout = function() {
 this.menu_open = false;

 for (j in this.option_divs) {
  var d = this.option_divs[j];
  d.className = 'stepper_option'
  if (d.peer.id == this.status.id) {
   d.style.display = 'block';
  } else {
   d.style.display = 'none';
  }
 }
};

//////////////////////////////////////////////////////////////////////

sangaku.question_item.munch = function(x) {
 for (var k of ['id','problem_sheet_id','parent_id',
                'position','header','title',
                'level','is_bottom',
                'problem','solution']) {
  if (k in x) { this[k] = x[k]; }

  if ('children' in x) {
   this.children = [];
   for (y of x.children) {
    var z = sangaku.question_item.munch(y);
    z.parent = this;
    this.children.push(z);
   }
  }
 }
};

sangaku.question_item.level_names =
 ['Sheet','Question','Part','Subpart',''];

sangaku.question_item.level_name = function() {
 return this.level_names[this.level];
};

sangaku.question_item.next_level_name = function() {
 return this.level_names[this.level+1];
};

sangaku.question_item.auto_header = function() {
 if (this.header) { return this.header; }
 if (this.level == 1 && this.position) { return 'Q' + this.position; }
 
 if (this.level == 2 && this.position >= 1 && this.position <= 26) {
  return '(' + String.fromCharCode(this.position + 96) + ')';
 }

 if (this.level == 3 && this.position >= 1 && this.position <= 12) {
  return ['','(i)','(ii)','(iii)','(iv)','(v)','(vi)','(vii)','(viii)','(ix)','(x)','(xi)','(xii)'][this.position];
 }

 return '';
};

sangaku.question_item.titled_header = function() {
 if (this.title) {
  return this.auto_header() + ': ' + this.title;
 } else {
  return this.auto_header();
 }
}

sangaku.question_item.full_header = function() {
 var h = this.parent ? this.parent.full_header() : '';
 return h + this.auto_header();
}

sangaku.question_item.header_tag = function() {
 var i = 1 + this.level;
 return 'h' + i;
};

//////////////////////////////////////////////////////////////////////

sangaku.session.munch = function(x) {
 for (var k of ['id','problem_sheet_id','tutorial_group_id',
                'start_time','end_time',
                'start_timestamp','end_timestamp',
                'duration']) {
  if (k in x) { this[k] = x[k]; }
 }

 if (x.problem_sheet) {
  this.problem_sheet = sangaku.problem_sheet.scrunch(x.problem_sheet);
 }

 if (x.tutorial_group) {
  this.tutorial_group = sangaku.tutorial_group.scrunch(x.tutorial_group);
 }

 if (x.student) {
  this.student = sangaku.student.scrunch(x.student);
  if (x.last_seen) {
   this.last_seen = x.last_seen;
  }
 }

 if (x.teacher) {
  this.teacher = sangaku.teacher.scrunch(x.teacher);
 }

 if (x.students) {
  this.students = [];
  for (s of x.students) {
   this.students.push(sangaku.student.scrunch(s));
  }
 }
};

sangaku.session.get_data_for_student = function(student_id) {
 var url = '/sangaku/ajax/get_session_student.php' +
     '?session_id=' + session_id + '&student_id=' + student_id;
 return fetch(url).then(
  response => response.json()
 ).then(
  x => callback(sangaku.session.scrunch(x))
 );
};

//////////////////////////////////////////////////////////////////////

sangaku.session.make_summary_page = function() {
 this.status_table = document.createElement('table');
 this.status_table.className = 'edged';
 this.header_tr = document.createElement('tr');
 this.status_table.appendChild(this.header_tr);
 this.header_tr.appendChild(document.createElement('td'));

 var sheet = this.problem_sheet;
 
 for (var x of sheet.bottom_items) {
  x.header_td = document.createElement('td');
  x.header_td.className = 'item_header';
  x.header_td.innerHTML = x.full_header();
  this.header_tr.appendChild(x.header_td);
 }

 for (var s of this.students) {
  s.tr = document.createElement('tr');
  this.status_table.appendChild(s.tr);

  s.name_td = document.createElement('td');
  s.name_td.className = 'student_name';
  s.name_td.innerHTML = s.forename + ' ' + s.surname;
  s.tr.appendChild(s.name_td);

  for (var x of sheet.bottom_items) {
   var u = s.item_status_by_id[x.id];
   var v = u.latest_status;
   if (! v) { v = Object.create(sangaku.question_item.statuses[0]); }
   u.td = document.createElement('td');
   u.td.className = 'status';
   u.td.style.position = 'relative';
   u.td.appendChild(u.status_span = document.createElement('span'));
   u.status_span.innerHTML = v.icon;
   u.td.appendChild(u.work_span = document.createElement('span'));
   u.work_span.className = 'work_icon';
   if (! u.has_uploads) {
    u.work_span.style.display = 'none';
   }
   u.work_span.innerHTML = sangaku.question_item.work_icon;

   var e = document.createElement('div');
   e.className = 'explain_status';
   e.style.display = 'none';
   if (v.tutor_text == 'Not started') {
    e.innerHTML = v.tutor_text;
   } else {
    e.innerHTML = v.tutor_text + ' ' + v.hms;
   }
   u.explain = e;
   u.td.appendChild(e);
   
   this.set_box_handlers(u);
   
   s.tr.appendChild(u.td);
  }
 }
};

//////////////////////////////////////////////////////////////////////

sangaku.user.munch = function(x) {
 for (var k of ['id','username','surname','forename']) {
  if (k in x) { this[k] = x[k]; }
 }
}

sangaku.student = Object.create(sangaku.user);
sangaku.teacher = Object.create(sangaku.user);

sangaku.student.munch = function(x) {
 for (var k of ['id','username','surname','forename',
               'last_seen']) {
  if (k in x) { this[k] = x[k]; }
 }

 if ('status_reports' in x) {
  this.status_reports = [];
  
  for (y of x.status_reports) {
   this.status_reports.push(sangaku.status_report.scrunch(y));
  }
 }

 if ('uploads' in x) {
  this.uploads = [];
  
  for (y of x.uploads) {
   this.uploads.push(sangaku.upload.scrunch(y));
  }
 }

 if ('item_status_by_id' in x) {
  this.item_status_by_id = x.item_status_by_id;
 }
};

//////////////////////////////////////////////////////////////////////

sangaku.upload.munch = function(x) {
 for (var k of ['id','session_id','item_id','student_id',
                'teacher_id','teacher_name',
                'source','file_extension','mime_type',
                'is_response','timestamp']) {
  if (k in x) { this[k] = x[k]; }
 }
};

sangaku.upload.url = function() {
 var d = new Date();
 var t = d.getTime();
 var u = '/sangaku/ajax/download.php?upload_id=' +
     this.id + '#' + t;
 return u;
};

sangaku.upload.create_dom = function() {
 var me = this;
 
 var t = this.mime_type;
 this.is_image = t && t.length >= 6 && t.substring(0,6) == 'image/';
 
 this.div = document.createElement('div');
 this.div.className = 'review';
 var c = document.createElement('div');
 c.className = 'upload_content';
 this.content_div = c;
 this.div.appendChild(this.content_div);

 var l = document.createElement('div');
 this.label_div = l;
 l.className = 'upload_label';
 this.div.appendChild(l);

 this.time_label = document.createElement('div');
 this.time_label.className = 'upload_time_label';
 this.time_label.innerHTML =
  sangaku.timestamp_to_hm(this.timestamp);
 l.appendChild(this.time_label);
 
 this.teacher_label = document.createElement('div');
 this.teacher_label.className = 'upload_teacher_label';
 this.teacher_label.innerHTML = this.teacher_name;
 l.appendChild(this.teacher_label);

 this.buttons_div = document.createElement('div');
 this.buttons_div.className = 'upload_buttons';
 l.appendChild(this.buttons_div);

 if (this.is_image) {
  this.rot = 0;

  this.rot_left_button = document.createElement('button');
  this.rot_left_button.type = 'button';
  this.rot_left_button.className = 'rot_button';
  this.rot_left_button.innerHTML = "\u27f2";
  this.rot_left_button.onclick = function() { me.rotate(1); };
  this.buttons_div.appendChild(this.rot_left_button);

  this.rot_right_button = document.createElement('button');
  this.rot_right_button.type = 'button';
  this.rot_right_button.className = 'rot_button';
  this.rot_right_button.innerHTML = "\u27f3";
  this.rot_right_button.onclick = function() { me.rotate(-1); };
  this.buttons_div.appendChild(this.rot_right_button);
 }
 
 this.delete_button = document.createElement('button');
 this.delete_button.className = 'upload_delete';
 this.delete_button.innerHTML = 'Delete';
 this.delete_button.onclick = function() {
  me.item.remove_upload(me.id);
 }
 
 this.buttons_div.appendChild(this.delete_button);
 
 this.edit_button = document.createElement('button');
 this.edit_button.className = 'upload_edit';
 this.edit_button.innerHTML = 'Edit';
 this.buttons_div.appendChild(this.edit_button);
 
 if (this.is_image) {
  var img = document.createElement('img');
  img.className = 'upload';
  img.onload = function() {
   var r = img.getBoundingClientRect();
   me.img_w = r.width;
   me.img_h = r.height;
   me.content_div.style['min-height'] = (me.img_h + 30) + 'px';
  };
  
  this.img = img;
  this.content_div.appendChild(img);
  img.src = this.url();
 } else if (t == 'text/html') {
  fetch(this.url()).then(
   x => x.text()
  ).then(
   function(x) {
    c.innerHTML = x;
    MathJax.typeset([c]);
   }
  );
 } else if (t == 'text/plain') {
  var p = document.createElement('pre');
  this.pre = p;
  c.appendChild(p);
  fetch(this.url()).then(
   x => x.text()
  ).then(
   x => (p.innerHTML = x)
  );
 } else {
  var f = document.createElement('iframe');
  this.iframe = f;
  f.className = 'upload';
  f.style.width = '640px';
  if (t == 'application/pdf') {
   f.style.height = '950px';
  }
  f.src = this.url();
  this.content_div.appendChild(f);
  f.onload = function() {
   var s = f.src;
   var b = f.contentWindow.document.body;
   var h = b.scrollHeight;
   if (h) { f.style.height = h + 'px'; }
  };
 }

 this.control_div = document.createElement('div');
 this.div.appendChild(this.control_div);

 return this.div;
};

sangaku.upload.rotate = function(x) {
 if (! ('img_w' in this)) {
  var i = this.img;
  var r = i.getBoundingClientRect();
  this.img_w = r.width;
  this.img_h = r.height;
 }

 this.rot += x;
 var angle = 90 * this.rot;
 var t = 'rotate(' + angle + 'deg)';
 this.img.style.transform = t;
 if (this.rot % 2) {
  this.content_div.style['min-height'] = this.img_w + 'px';
  var z = (this.img_w - this.img_h)/2;
  this.img.style.top = z + 'px';
 } else {
  this.content_div.style['min-height'] = this.img_h + 'px';
  this.img.style.top = '0px';
 }
}

sangaku.upload.update_dom = function() {
 var t = this.mime_type;
 var c = this.content_div;
 if (t.length >= 6 && t.substring(0,6) == 'image/') {
  this.img.src = this.url();
 } else if (t == 'text/html') {
  fetch(this.url()).then(
   x => x.text()
  ).then(
   function(x) {
    c.innerHTML = x;
    MathJax.typeset([c]);
   }
  );
 } else if (t == 'text/plain') {
  var p = this.pre;
  fetch(this.url()).then(
   x => x.text()
  ).then(
   x => (p.innerHTML = x)
  );
 } else {
  var f = this.iframe;
  f.src = this.url();
 }

 this.time_label.innerHTML =
  sangaku.timestamp_to_hm(this.timestamp);

 this.teacher_label.innerHTML = this.teacher_name;
};


