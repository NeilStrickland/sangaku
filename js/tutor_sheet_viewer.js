sangaku.tutor_sheet_viewer = {
 stage : 0,
 interval : 5000 // update inteval in milliseconds  
};

sangaku.tutor_sheet_viewer.init = function(session_id,student_id,item_id,teacher_id) {
 var me = this;
 
 var url = '/sangaku/ajax/get_session_student.php' +
     '?session_id=' + session_id +
     '&student_id=' + student_id;
 
 fetch(url).then(
  response => response.json()
 ).then(
  x => me.init_data(sangaku.session.scrunch(x),item_id)
 ).catch(
  x => me.show_error(x)
 )
};

sangaku.tutor_sheet_viewer.init_data = function(x,item_id) {
 this.session = x;
 this.student = x.student;
 this.teacher = x.teacher;
 this.problem_sheet = x.problem_sheet;
 this.tutorial_group = x.tutorial_group;

 this.h1 = document.createElement('h1');
 this.h1.innerHTML =
  this.problem_sheet.title + '<br/>' +
  'Group ' + this.tutorial_group.module_code +
  '(' + this.tutorial_group.name + ')' + 
  ': ' + this.student.forename + ' ' + this.student.surname;
 document.body.appendChild(this.h1);
 MathJax.typeset([this.h1]);

 this.intro_div = document.createElement('div');
 this.intro_div.className = 'sheet_intro';
 this.intro_div.innerHTML = this.problem_sheet.intro;
 document.body.appendChild(this.intro_div);
 MathJax.typeset([this.intro_div]);

 this.question_items = [];
 this.question_items_by_id = {};
 this.bottom_items = [];
 this.bottom_items_by_id = {};

 for (item0 of this.problem_sheet.question_items) {
  var item = this.question_item.create(item0);
  item.session_id = this.session.id;
  item.student_id = this.student.id;
  item.teacher_id = this.teacher.id;
  this.question_items.push(item);
  this.question_items_by_id[item.id] = item;

  if (item.parent_id) {
   item.parent = this.question_items_by_id[item.parent_id];
  } else {
   item.parent = null;
  }
  
  document.body.appendChild(item.create_dom(this));

  if (item.is_bottom) {
   this.bottom_items.push(item);
   this.bottom_items_by_id[item.id] = item;
   item.status_reports = [];
   item.uploads = [];
   item.uploads_by_id = {};
   item.latest_report = null;
   item.latest_status = sangaku.statuses[0];
  }
 }
 
 for (var r of this.student.status_reports) {
  var item = this.bottom_items_by_id[r.item_id];
  item.add_status_report(r);
 }
 
 for (var u of this.student.uploads) {
  var item = this.bottom_items_by_id[u.item_id];
  item.add_upload(u);
 }

 this.bottom_spacer = document.createElement('div');
 this.bottom_spacer.innerHTML = '&nbsp;';
 this.bottom_spacer.style['min-height'] = '50px';
 document.body.appendChild(this.bottom_spacer);

 if (item_id && this.question_items_by_id[item_id]) {
  this.question_items_by_id[item_id].open();
 }

 var me = this;
 setTimeout(function() { me.update(); },me.interval);
};

sangaku.tutor_sheet_viewer.question_item = {
 is_open : false
};

sangaku.tutor_sheet_viewer.question_item.create = function(item) {
 var x = Object.create(this);
 Object.assign(x,item);
 x.header = item.auto_header();
 x.titled_header = item.titled_header();
 x.full_header = item.full_header();
 
 return x;
};

sangaku.tutor_sheet_viewer.question_item.add_status_report = function(r) {
 this.latest_report = r;
 this.latest_status = sangaku.statuses[r.status_id];
 this.status_div.innerHTML = this.latest_status.icon;
}

sangaku.tutor_sheet_viewer.question_item.add_upload = function(u) {
 this.uploads.push(u);
 this.uploads_by_id[u.id] = u;
 this.has_uploads = true;
 this.work_icon_div.style.visibility = 'visible';
 u.create_dom();
 u.item = this;
 this.upload_block.reviews_div.appendChild(u.div);
 MathJax.typeset([u.div]);
};

sangaku.tutor_sheet_viewer.question_item.modify_upload = function(u) {
 var u0 = this.uploads_by_id[u.id];
 u0.munch(u);
 u0.update_dom();
 MathJax.typeset([u0.div]);
};

sangaku.tutor_sheet_viewer.question_item.remove_upload = function(id) {
 var ul = [];
 var ut = {};
 for (u of this.uploads) {
  if (u.id == id) {
   this.upload_block.reviews_div.removeChild(u.div);
   var url = '/sangaku/ajax/delete_upload.php?id=' + u.id;
   fetch(url);
  } else {
   ul.push(u);
   ut[u.id] = u;
  }
 }
 
 this.uploads = ul;
 this.uploads_by_id = ut;
 this.has_uploads = ul ? true : false;
 this.work_icon_div.style.visibility = ul ? 'visible' : 'hidden';
};

sangaku.tutor_sheet_viewer.question_item.create_dom = function(viewer) {
 this.viewer = viewer;
 this.div = document.createElement('div');
 this.header_div = document.createElement('div');
 this.header_div.className = 'item_review_header';
 this.div.appendChild(this.header_div);
 this.toggler = document.createElement('img');
 this.toggler.className = 'toggler';
 this.toggler.src = '/sangaku/icons/expand.png';
 this.header_div.appendChild(this.toggler);
 this.h = document.createElement('h3');
 this.h.innerHTML = this.full_header + ' ';
 this.header_div.appendChild(this.h);
 this.status_div = document.createElement('div');
 this.status_div.className = 'item_review_status';
 this.header_div.appendChild(this.status_div);
 this.work_icon_div = document.createElement('div');
 this.work_icon_div.className = 'item_review_work_icon';
 this.work_icon_div.style.visibility = 'hidden';
 this.work_icon_div.innerHTML = sangaku.work_icon;
 this.header_div.appendChild(this.work_icon_div);

 this.body_div = document.createElement('div');
 this.body_div.className = 'item_review_body';
 this.body_div.style.display = 'none';
 this.div.appendChild(this.body_div);
 
 this.problem_div = document.createElement('div');
 this.problem_div.className = 'item_review_problem';
 this.problem_div.innerHTML = this.problem;
 this.body_div.appendChild(this.problem_div);

 if (this.solution) {
  this.solution_div = document.createElement('div');
  this.solution_div.className = 'item_review_solution';
  this.solution_div.innerHTML = this.solution;
  this.body_div.appendChild(this.solution_div);
 }
 
 if (this.is_bottom) {
  this.upload_block =
   sangaku.create_upload_block(
    this.session_id,
    this.student_id,
    this,
    this.teacher_id
   );
  this.upload_block.panel_div.style.display = 'block';
  this.body_div.appendChild(this.upload_block.panel_div);
 }

 var me = this;
 this.toggler.onclick = function() { me.toggle(); };
 
 MathJax.typeset([this.div]);
 return this.div;
};

sangaku.tutor_sheet_viewer.question_item.open = function() {
 this.is_open = true;
 this.body_div.style.display = 'block';
 this.toggler.src = '/sangaku/icons/contract.png';

 if (this.parent) {
  this.parent.open();
 }
}

sangaku.tutor_sheet_viewer.question_item.close = function() {
 this.is_open = false;
 this.body_div.style.display = 'none';
 this.toggler.src = '/sangaku/icons/expand.png';
}

sangaku.tutor_sheet_viewer.question_item.toggle = function() {
 if (this.is_open) {
  this.close();
 } else {
  this.open();
 }
}


sangaku.tutor_sheet_viewer.show_error = function(x) {
 var d = document.createElement('div');
 d.innerHTML = 'error fetching data';
 
 document.body.appendChild(d);
 console.log(x);
};

sangaku.tutor_sheet_viewer.update = function() {
 var me = this;
 
 var url = '/sangaku/ajax/get_session_student.php' +
     '?session_id=' + this.session.id + '&student_id=' + this.student.id;
 
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

sangaku.tutor_sheet_viewer.update_data = function(x) {
 this.new_stage = this.stage;
 
 for (var item of this.bottom_items) {
  item.new_report = null;
  item.new_uploads = [];
  item.modified_uploads = [];
  item.notify_uploads = [];
  for (u of item.uploads) { u.seen = false; }
 }

 for (var r of x.student.status_reports) {
  var item = this.bottom_items_by_id[r.item_id];
  if (! item.latest_report || r.timestamp > item.latest_report.timestamp) {
   item.new_report = r;
  }
 }

 for (u0 of x.student.uploads) {
  var item = this.bottom_items_by_id[u0.item_id];
  var u1 = item.uploads_by_id[u0.id];
  if (u1) {
   u1.seen = true;
   if (Date.parse(u0.timestamp) > Date.parse(u1.timestamp)) {
    item.modified_uploads.push(u0);
    if (u0.teacher_id) {
     item.notify_uploads.push(u0);
    }
   }
  } else {
   item.new_uploads.push(u0);
   u0.seen = true;
   if (u0.teacher_id) {
    item.notify_uploads.push(u0);
   }
  }
 }

 for (item of this.bottom_items) {
  for (u of item.new_uploads) {
   item.add_upload(u);
  }

  for (u of item.modified_uploads) {
   item.modify_upload(u);
  }

  for (u of item.uploads) {
   if (! u.seen) {
    item.remove_upload(u.id);
   }
  }

  item.work_icon_div.style.visibility =
   item.uploads.length ? 'visible' : 'hidden';
 }
}
