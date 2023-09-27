sangaku.session_monitor = {
 interval : 5000 // update inteval in milliseconds
};

sangaku.session_monitor.init = function(session_id) {
 var me = this;

 for (var id of ['session_tab',
		 'session_header',
		 'monitor_tab',
		 'sheet_tab',
		 'snapshots_tab',
		 'polls_tab',
		 'help_tab']) {
  this[id] = document.getElementById(id);
 }
 
 var url = '/sangaku/ajax/get_session_data.php' +
     '?session_id=' + session_id;
 
 fetch(url).then(
  response => response.json()
 ).then(
  x => me.init_data(x)
 ).catch(
  x => me.show_error(x)
 )
};

sangaku.session_monitor.init_data = function(x) {
 var me = this;
 this.session = sangaku.session.scrunch(x);

 var sheet = this.session.problem_sheet;
 var group = this.session.tutorial_group;
 var students = this.session.students;
 var poll_instances = this.session.poll_instances;
 
 var login_url = document.getElementById('login_url');
 var login_qr = document.getElementById('login_qr');

 new QRCode(login_qr,{text : login_url.innerText, width: 512, height : 512});
 
 this.students_by_id = {};

 if (this.monitor_tab) {
  this.status_table = document.createElement('table');
  this.status_table.className = 'edged';
  this.monitor_tab.appendChild(this.status_table);
 
  this.header_tr = document.createElement('tr');
  this.status_table.appendChild(this.header_tr);
  this.header_tr.appendChild(document.createElement('td'));
 
  sheet.bottom_items_by_id = {};
 
  for (var item of sheet.bottom_items) {
   item.header_td = document.createElement('td');
   item.header_td.className = 'item_header';
   item.header_td.innerHTML = item.full_header();
   this.header_tr.appendChild(item.header_td);

   sheet.bottom_items_by_id[item.id] = item;
  }

  sheet.has_solutions = false;
  for (var item of sheet.bottom_items) {
   if (item.solution) {
    sheet.has_solutions = true;
   }
  }

  if (sheet.has_solutions) {
   this.solutions_tr = document.createElement('tr');
   this.status_table.appendChild(this.solutions_tr);
   this.solutions_td = document.createElement('td');
   this.solutions_td.innerHTML = 'Show solution to students';
   this.solutions_tr.appendChild(this.solutions_td);
   for (var item of sheet.bottom_items) {
    item.show_solution_td = document.createElement('td');
    this.solutions_tr.appendChild(item.show_solution_td);
    if (item.solution) {
     item.solution_shown = this.session.solutions_shown_array.includes(item.id);
     var cb = document.createElement('input');
     item.show_solution_cb = cb;
     cb.type = 'checkbox';
     cb.checked = item.solution_shown;
     cb.onclick = function() { me.save_solutions_shown(); };
     item.show_solution_td.appendChild(cb);
    } else {
     item.show_solution_td.innerHTML = '&nbsp;';
    }
   }
  }

  for (var student of students) {
   this.add_student(student);
  }
 }

 if (this.polls_tab) {
  this.mode_div = document.createElement('div');
  this.polls_tab.appendChild(this.mode_div);
  var s = document.createElement('span');
  s.innerHTML = 'Mode: ';
  this.mode_div.appendChild(s);
  
  this.poll_mode = 'projector';
  this.mode_button = {};
  for (var m of ['projector','screen']) {
   var b = document.createElement('button');
   this.mode_button[m] = b;
   b.innerHTML = m;
   b.className = (m == this.poll_mode) ? 'poll_mode_active' : 'poll_mode';
   this.mode_div.appendChild(b);
  }

  this.mode_button['projector'].onclick = function() { me.set_mode('projector'); }
  this.mode_button['screen'].onclick    = function() { me.set_mode('screen'); }
  
  this.mode_help_toggler = document.createElement('img');
  this.mode_help_toggler.src = '/sangaku/icons/qmark.png';
  this.mode_help_toggler.width = 16;
  this.mode_help_toggler.style['margin-left'] = '5px';
  this.mode_div.appendChild(this.mode_help_toggler);
  this.mode_help_div = document.createElement('div');
  this.mode_help_div.className = 'mode_help';
  this.mode_div.appendChild(this.mode_help_div);
  this.mode_help_div.innerHTML =
   "<br/><br/>" +
   "Use projector mode if this page is being displayed on a teaching " +
   "room projector and so is visible to some or all of the students " +
   "participating in the session.  In this mode, information about " +
   "the number and correctness of responses will not be displayed " +
   "on this page until after the poll has closed. " +
   "<br/><br/>" +
   "Use screen mode if this page is being displayed on a screen that " +
   "is only visible to the teacher.  In this mode, information about the " +
   "number of responses of each type will be displayed, and updated every " +
   "few seconds, as soon as the poll has been opened." +
   "<br/><br/>";

  this.mode_help_toggler.onclick = function() {
   var s = me.mode_help_div.style;
   s.display = (s.display == 'block') ? 'none' : 'block';
  };
  
  this.polls_tab.appendChild(document.createElement('br'));
  
  var opts = {
   show             : 1,
   show_title       : 1,
   show_content     : 0,
   show_intro       : 1,
   show_items       : 1,
   show_count       : 0,
   show_results     : 0,
   show_correctness : 0,
   show_state       : 0,
   show_solution    : 0,
   show_button      : 0,
   enable           : 0   
  }

  var last_poll = null;
  var one_open = false;
  
  for (var inst of poll_instances) {
   inst.create_dom(this.polls_tab);
   inst.show_counts();
   inst.add_toggler();
   inst.add_stepper();
   inst.set_dom_opts(opts);
   inst.next_poll = null;
   if (last_poll) {
    last_poll.next_poll = inst;
   }
   if (inst.state != 'after' && ! one_open) {
    inst.toggled = 1;
    inst.toggler.src = '/sangaku/icons/contract.png';
    inst.content_div.style.display = 'block';
    one_open = true;
   }

   last_poll = inst;
   inst.set_monitor_state();
  }
 }
 
 var me = this;
 setTimeout(function() { me.update(); },me.interval);
};

sangaku.session_monitor.set_mode = function(mode) {
 this.poll_mode = mode;

 for (var inst of this.session.poll_instances) {
  inst.mode = mode;
  inst.set_monitor_state();
 }

 for (m in this.mode_button) {
  this.mode_button[m].className = (m == mode) ? 'poll_mode_active' : 'poll_mode';
 }
}

sangaku.poll_instance.add_toggler = function() {
 var me = this;

 this.title.className = 'poll_list_title';
 this.toggler = document.createElement('img');
 this.toggler.style['margin-right'] = '5px';
 this.toggler.src = '/sangaku/icons/expand.png';
 this.title.prepend(this.toggler);
 this.toggled = 0;
 
 this.toggler.onclick = function() {
  if (me.toggled) {
   me.toggled = 0;
   me.toggler.src = '/sangaku/icons/expand.png';
   me.content_div.style.display = 'none';
  } else {
   me.toggled = 1;
   me.toggler.src = '/sangaku/icons/contract.png';
   me.content_div.style.display = 'block';
  }  
 }
};

sangaku.poll_instance.add_stepper = function() {
 this.stepper_div = document.createElement('div');
 this.content_div.appendChild(document.createElement('br'));
 this.content_div.appendChild(this.stepper_div);
 this.stepper_button = {};

 for (var state of this.states) {
  if (state == 'correct' && ! this.poll.is_judgemental) { continue; }
  var b = document.createElement('button');
  b.innerHTML = state;
  b.title = this.explain_state[state];
  b.className = (state == this.state) ? 'poll_state_active' : 'poll_state';
  this.stepper_button[state] = b;
  this.stepper_div.appendChild(b);

  this.add_stepper_handler(b,state);
 }
};

sangaku.poll_instance.add_stepper_handler = function(b,state) {
 var me = this;
 b.onclick = function() { me.handle_step(state); };
};

sangaku.poll_instance.handle_step = function(state) {
 this.state = state;
 this.set_monitor_state();
 
 for (var s of this.states) {
  if (s in this.stepper_button) {
   var b = this.stepper_button[s];
   b.className = (s == state) ? 'poll_state_active' : 'poll_state';
  }
 }

 if (state == 'after') {
  this.toggled = 0;
  this.toggler.src = '/sangaku/icons/expand.png';
  this.content_div.style.display = 'none';

  inst = this.next_poll;
  if (inst) {
   inst.toggled = 1;
   inst.toggler.src = '/sangaku/icons/contract.png';
   inst.content_div.style.display = 'block';
  }
 }
 
 var x = Object.create(sangaku.poll_instance);
 x.id = this.id;
 x.state = this.state;
 x.save();
};

sangaku.poll_instance.set_monitor_state = function() {
 var opts = {
  show             : 1,
  show_title       : 1,
  show_content     : this.toggled,
  show_intro       : 1,
  show_items       : 1,
  show_count       : 0,
  show_results     : 0,
  show_correctness : 0,
  show_state       : 0,
  show_solution    : 0,
  show_button      : 0,
  enable           : 0
 };

 if (this.mode == 'screen') {
  if (this.state == 'open' || this.state == 'closed' ||
      this.state == 'count' || this.state == 'correct') {
   opts.show_count = 1;
   opts.show_results = 1;
   opts.show_correctness = 1;
   opts.show_solution = 1;
  }
 } else {
  if (this.state == 'count' || this.state == 'correct') {
   opts.show_count = 1;
   opts.show_results = 1;
  }

  if (this.state == 'correct') {
   opts.show_correctness = 1;
   opts.show_solution = 1;
  }
 }

 this.set_dom_opts(opts);
}

sangaku.session_monitor.add_student = function(student) {
 var sheet = this.session.problem_sheet;
 this.students_by_id[student.id] = student;
 student.tr = document.createElement('tr');
 this.status_table.appendChild(student.tr);
 student.name_td = document.createElement('td');
 student.name_td.className = 'student_name';
 student.name_td.innerHTML = student.forename + ' ' + student.surname;
 student.tr.appendChild(student.name_td);
 student.last_seen = 0;
 student.box = {};
 for (var item of sheet.bottom_items) {
  var r = student.item_status_by_id[item.id];
  var u = Object.create(sangaku.session_monitor.box);
  student.box[item.id] = u;
  u.student_id = student.id;
  u.student_username = student.username;
  u.session_id = this.session.id;
  u.item_id = item.id;
  u.create_dom();
  u.set_data(r);
  u.set_handlers();
  student.tr.appendChild(u.td);
  student.last_seen = Math.max(student.last_seen,u.data.last_access_time);
 }

 student.tr.style.display =
  student.last_seen ? 'table-row' : 'none';
}

sangaku.session_monitor.box = {
 data : null,
 latest_status : null,
 date : null,
 hms : ''
};

sangaku.session_monitor.box.create_dom = function() {
 this.td = document.createElement('td');
 this.td.className = 'status';
 this.td.style.position = 'relative';
 
 this.status_span = document.createElement('span');
 this.td.appendChild(this.status_span);
 
 this.work_span = document.createElement('span');
 this.work_span.className = 'work_icon';
 this.work_span.style.display = 'none';
 this.work_span.innerHTML = sangaku.work_icon;
 this.td.appendChild(this.work_span);
 
 this.explain = document.createElement('div');
 this.explain.className = 'explain_status';
 this.explain.style.display = 'none';
 this.td.appendChild(this.explain);
};

sangaku.session_monitor.box.set_data = function(r) {
 this.data = r;
 var s;

 if (r.last_status_time || r.last_access_time || r.last_response_time || r.has_uploads) {
  var z = 1;
 }
 
 if (r.last_response_time > r.last_access_time) {
  s = sangaku.statuses_by_code['responded'];
 } else if (r.latest_report) {
  s = sangaku.statuses[r.latest_report.status_id];
 } else {
  s = sangaku.statuses[0];
 }
 this.latest_status = s;
 this.date = new Date(r.last_status_time * 1000);
 this.hms = this.date.toLocaleTimeString();
 this.status_span.innerHTML = s.icon;
 this.work_span.style.display = r.has_uploads ? 'inline' : 'none';

 if (this.latest_status.code == 'not_started') {
  this.explain.innerHTML = s.tutor_text;
 } else {
  this.explain.innerHTML = s.tutor_text + ' ' + this.hms;
 }
}

sangaku.session_monitor.save_solutions_shown = function() {
 var ss = [];
 for (var item of this.session.problem_sheet.bottom_items) {
  if (item.show_solution_cb && item.show_solution_cb.checked) {
   ss.push(item.id);
  }
 }

 this.session.solutions_shown_array = ss;
 this.session.solutions_shown = JSON.stringify(ss);
 this.session.save();
}

sangaku.session_monitor.box.set_handlers = function() {
 var me = this;
 this.td.onclick = function() {
  var url =
      '/sangaku/show_student_session.php' +
      '?student_id=' + me.student_id +
      '&session_id=' + me.session_id +
      '&item_id=' + me.item_id;
  window.open(url,me.student_username);
 };

 this.td.onmouseover = function() {
  me.td.style.background = '#CCC';
  me.explain.style.display = 'block';
 }

 this.td.onmouseout = function() {
  me.td.style.background = '#FFF';
  me.explain.style.display = 'none';
 }

 this.explain.onclick = function() {
  me.explain.style.display = 'none';
 }
};

sangaku.session_monitor.show_error = function(x) {
 var d = document.createElement('div');
 d.innerHTML = 'error fetching data';
 
 document.body.appendChild(d);
 console.log(x);
};

sangaku.session_monitor.update = function() {
 var me = this;

 var url = '/sangaku/ajax/get_session_data.php' +
     '?session_id=' + this.session.id;
 
 fetch(url).then(
  response => response.json()
 ).then(
  function(x) {
   var y = sangaku.session.scrunch(x);
   me.update_data(y)
  }
 ).catch(
  function(x) {
   console.log('Update failed');
   console.log(x)
  }
 ).finally(
  x => setTimeout(function() { me.update(); },me.interval)
 )
};

sangaku.session_monitor.update_data = function(x) {
 var session = this.session;
 var sheet = session.problem_sheet;
 var group = session.tutorial_group;
 var students = session.students;
 var poll_instances = session.poll_instances;
 
 session.solutions_shown = x.solution_shown;
 session.solutions_shown_array = JSON.parse(x.solutions_shown);
 if (! session.solutions_shown_array) {
  session.solutions_shown_array = [];
 }

 if (sheet && this.monitor_tab) {
  for (var item of sheet.bottom_items) {
   if (item.show_solution_cb) {
    item.show_solution_cb.checked = 
     session.solutions_shown_array.includes(item.id) ? 'checked' : '';
   }
  }
 }

 if (this.monitor_tab) {
  for (s of x.students) {
   var student;
   if (s.id in this.students_by_id) {
    student = this.students_by_id[s.id];
   } else {
    this.add_student(s);
    student = s;
   }
  
   student.last_seen = 0;
   
   for (var item of sheet.bottom_items) {
    var u = student.box[item.id];
    u.set_data(s.item_status_by_id[item.id]);
    student.last_seen = Math.max(student.last_seen,u.data.last_access_time);
    student.tr.style.display =
     student.last_seen ? 'table-row' : 'none';
   }
  }
 }

 if (this.polls_tab) {
  var total_count = 0;
  
  for (var inst of poll_instances) {
   if (! inst.id in x.poll_instances_by_id) { continue; }
   var inst0 = x.poll_instances_by_id[inst.id];
   inst.state = inst0.state;
   for (var id in inst.poll.items_by_id) {
    if (! id in inst0.poll.items_by_id) { continue; }
    var item = inst.poll.items_by_id[id];
    var item0 = inst0.poll.items_by_id[id];
    if ('is_correct' in item0) {
     item.is_correct = item0.is_correct;
    }
    if ('count' in item0) {
     item.count = item0.count;
    }
   }

   inst.show_counts();
   inst.set_monitor_state();
  }
 }
}
