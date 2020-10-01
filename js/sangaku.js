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

 if (x.question_items) {
  this.question_items = [];
  this.question_items_by_id = {};
  this.question_items_by_full_header = {};
  this.bottom_items = [];
  this.bottom_items_by_id = {};
  this.bottom_items_by_full_header = {};
  
  for (y of x.question_items) {
   var item = sangaku.question_item.scrunch(y);
   item.item_index = this.question_items.length;
   this.question_items.push(item);
   this.question_items_by_id[item.id] = item;
   this.question_items_by_full_header[item.full_header] = item;
   if (item.is_bottom) {
    item.bottom_index = this.bottom_items.length;
    this.bottom_items.push(item);
    this.bottom_items_by_id[item.id] = item;
    this.bottom_items_by_full_header[item.full_header] = item;
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
  d.className = 'stepper_option';
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
  d.className = (d.peer.id == i) ? 'stepper_option_active' : 'stepper_option';
  d.style.display = 'block';
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
                'titled_header','header','full_header',
                'level','is_bottom',
                'problem','solution']) {
  if (k in x) { this[k] = x[k]; }
 }
};

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
  x.header_td.innerHTML = x.full_header;
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
  this.item_status_by_id = x;
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
 
 this.div = document.createElement('div');
 this.div.className = 'review';
 var c = document.createElement('div');
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
 
 var t = this.mime_type;
 if (t.length >= 6 && t.substring(0,6) == 'image/') {
  var img = document.createElement('img');
  img.className = 'upload';
  img.src = this.url();
  this.img = img;
  this.img.style.width = '640px';
  this.content_div.appendChild(img);
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

//////////////////////////////////////////////////////////////////////

sangaku.init = function() {
 var me = this;

 this.status_option_by_code = {};
 for (var i in this.statuses) {
  var x = this.statuses[i];
  x.index = i;
  this.status_option_by_code[x.code] = x;
 }
 
 var questions_ = document.evaluate(".//div[@class='question']",
				    document,null,
				    XPathResult.ORDERED_NODE_ITERATOR_TYPE);
 this.items = [];
 this.bottom_items = [];
 this.questions = [];

 var question_ = questions_.iterateNext();
 var question = null;

 while(question_) {
  question = Object.create(this.question);
  question.question_index = this.questions.length;
  question.item_index = this.items.length;
  this.questions.push(question);
  this.items.push(question);

  question.div = question_;
  question.get_header();
  question.parts = [];
  var parts_ = document.evaluate(".//div[@class='part']",
				 question_,null,
				 XPathResult.ORDERED_NODE_ITERATOR_TYPE);
  var part_ = parts_.iterateNext();

  while(part_) {
   var part = Object.create(this.part);
   part.part_index = question.parts.length;
   part.item_index = this.items.length;
   question.parts.push(part);
   this.items.push(part);

   part.parent = question;
   part.div = part_;
   part.get_header();
   part.subparts = [];

   var subparts_ = document.evaluate(".//div[@class='subpart']",
				     part_,null,
				     XPathResult.ORDERED_NODE_ITERATOR_TYPE);
   var subpart_ = subparts_.iterateNext();

   while(subpart_) {
    var subpart = Object.create(this.subpart);
    subpart.subpart_index = part.subparts.length;
    subpart.item_index = this.items.length;
    part.subparts.push(subpart);
    this.items.push(subpart);

    subpart.parent = part;
    subpart.div = subpart_;
    subpart.get_header();

    subpart.bottom_index = this.bottom_items.length;
    this.bottom_items.push(subpart)
    subpart_ = subparts_.iterateNext();
   }

   if (! part.subparts.length) {
    part.bottom_index = this.bottom_items.length;
    this.bottom_items.push(part)
   }

   var part_ = parts_.iterateNext();
  }

  if (! question.parts.length) {
   question.bottom_index = this.bottom_items.length;
   this.bottom_items.push(question);
  }

  question_ = questions_.iterateNext();
 }

 for (i in this.items) {
  var x = this.items[i];
  x.id = this.item_ids[x.full_header];
 }
 
 for (i in this.bottom_items) {
  var x = this.bottom_items[i];

  x.control_div = document.createElement('div');
  x.control_div.className = 'control';
  x.div.appendChild(x.control_div);

  x.shower  = this.create_shower(x);
  x.stepper = this.create_stepper(x);
 }

 this.set_stage(0);
 var x = this.bottom_items[this.stage];
 x.stepper.handle_click(1);
};

sangaku.set_stage = function(s) {
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

sangaku.step_forward = function() {
 this.set_stage(this.stage + 1);
 var x = this.bottom_items[this.stage];
 x.stepper.handle_click(1);
};

sangaku.step_backward = function() {
 this.set_stage(this.stage - 1);
};
