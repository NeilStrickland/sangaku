sangaku.assign_groups = {};

sangaku.assign_groups.init = function() {
 this.groups = [];
 this.groups_by_id = {};
 this.students = [];
 this.students_by_id = {};

 for (var g0 of groups) {
  var g = Object.create(sangaku.tutorial_group);
  g.id = g0[0];
  g.name = g0[1];
  this.groups.push(g);
  this.groups_by_id[g.id] = g;
 }

 for (var s0 of students) {
  var s = Object.create(sangaku.user);
  s.id = s0[0];
  s.username = s0[1];
  s.surname  = s0[2];
  s.forename = s0[3];
  s.memberships = {};
  for (var g of this.groups) { 
   s.memberships[g.id] = null;
  }
  this.students.push(s);
  this.students_by_id[s.id] = s;
 }

 for (var m0 of group_memberships) {
  var m = Object.create(sangaku.tutorial_group_student);
  m.id = m0[0];
  m.student_id = m0[1];
  m.tutorial_group_id = m0[2];
  s = this.students_by_id[m.student_id];
  g = this.groups_by_id[m.tutorial_group_id];
  if (s && g) { s.memberships[g.id] = m; }
 }

 this.tbody = document.getElementById('students_tbody');

 for (s of this.students) {
  this.create_student_dom(s);
 }
}

sangaku.assign_groups.create_student_dom = function(s) {
 var me = this;

 s.tr = document.createElement('tr');
 s.username_td = document.createElement('td');
 s.username_td.innerHTML = s.username;
 s.tr.appendChild(s.username_td);
 s.name_td = document.createElement('td');
 s.name_td.innerHTML = s.surname + ', ' + s.forename;
 s.tr.appendChild(s.name_td);

 s.group_td = {};
 s.group_cb = {};

 for (var g of this.groups) {
  var td = document.createElement('td');
  s.group_td[g.id] = td;
  s.tr.appendChild(td);

  var cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = s.memberships[g.id] ? 1 : 0;
  s.group_cb[g.id] = cb;
  td.appendChild(cb);
  this.set_handler(s,g.id);
 }

 this.tbody.appendChild(s.tr);
}

sangaku.assign_groups.set_handler = function(s,i) {
 var me = this;
 s.group_cb[i].onclick = function() { me.handle_click(s,i); }
}

sangaku.assign_groups.handle_click = function(s,i) {
 var cb = s.group_cb[i];
 var m = s.memberships[i];
 if (m) {
  m.del();
  s.memberships[i] = null;
  cb.checked = 0;
 } else {
  m = Object.create(sangaku.tutorial_group_student);
  m.student_id = s.id;
  m.tutorial_group_id = i;
  m.save();
  s.memberships[i] = m;
  cb.checked = 1;
 }
}