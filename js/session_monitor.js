sangaku.session_monitor = {
 interval : 5000 // update inteval in milliseconds
};

sangaku.session_monitor.init = function(session_id) {
 var me = this;

 var url = '/sangaku/ajax/get_session_data.php' +
     '?session_id=' + session_id;
 
 fetch(url).then(
  response => response.json()
 ).then(
  x => me.init_data(sangaku.session.scrunch(x))
 ).catch(
  x => me.show_error(x)
 )
};

sangaku.session_monitor.init_data = function(x) {
 this.session = x;

 var sheet = this.session.problem_sheet;
 var group = this.session.tutorial_group;
 var students = this.session.students;
 this.students_by_id = {};
 
 this.h1 = document.createElement('h1');
 this.h1.innerHTML =
  sheet.title + '<br/>' +
  'Group ' + group.module_code +
  '(' + group.name + ')';
 document.body.appendChild(this.h1);
 MathJax.typeset([this.h1]);
 
 this.status_table = document.createElement('table');
 this.status_table.className = 'edged';
 document.body.appendChild(this.status_table);
 
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

 for (var student of students) {
  this.add_student(student);
 }

 var me = this;
 setTimeout(function() { me.update(); },me.interval);
};

sangaku.session_monitor.add_student = function(student) {
 var sheet = this.session.problem_sheet;
 this.students_by_id[student.id] = student;
 student.tr = document.createElement('tr');
 this.status_table.appendChild(student.tr);
 student.name_td = document.createElement('td');
 student.name_td.className = 'student_name';
 student.name_td.innerHTML =
  student.forename + ' ' + student.surname
  + ' (' + student.id + ')';
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
 var sheet = this.session.problem_sheet;
 var group = this.session.tutorial_group;
 var students = this.session.students;

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
