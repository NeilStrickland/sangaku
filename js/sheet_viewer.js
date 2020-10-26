sangaku.sheet_viewer = {
 stage : 0,
 interval : 5000 // update inteval in milliseconds  
};

// This function loads information about the session and student
// from the page ajax/get_session_student.php.  More precisely,
// this function returns immediately but sets things up via promises 
// to ensure that the functions sangaku.session.scrunch() and then
// sangaku.sheet_viewer.init_data() will be called to process the
// information when it is received from the server.
sangaku.sheet_viewer.init = function(session_id,student_id) {
 var me = this;
 
 var url = '/sangaku/ajax/get_session_student.php' +
     '?session_id=' + session_id + '&student_id=' + student_id;
 
 fetch(url).then(
  response => response.json()
 ).then(
  x => me.init_data(sangaku.session.scrunch(x))
 ).catch(
  x => me.show_error(x)
 )
};

// Here x will be an instance of sangaku.session constructed in such
// a way that x.student, x.problem_sheet and x.session are instances
// of sangaku.student, sangaku.problem_sheet and sangaku.session,
// respectively.
sangaku.sheet_viewer.init_data = function(x) {
 var me = this;
 
 this.session = x;
 this.student = x.student;
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

 // If the session has not started yet, this div will show a countdown
 // to the start time.  The main div with the questions will be hidden
 // until then.
 this.countdown_div = document.createElement('div');
 this.countdown_div.className = 'countdown';
 this.countdown_div.style.display = 'none';
 document.body.appendChild(this.countdown_div);

 // The main div with the questions etc
 this.sheet_div = document.createElement('div');
 this.sheet_div.style.display = 'none';
 document.body.appendChild(this.sheet_div);

 // Button to show visualiser snapshots
 this.snapshots_button = document.createElement('button');
 this.snapshots_button.className = 'snapshots';
 this.snapshots_button.innerHTML = 'Show visualiser snapshots';
 this.snapshots_button.onclick = function() {
  window.open('/sangaku/show_snapshots.php?session_id=' + me.session.id,
	      'snapshots_' + me.session.id);
 }
 this.snapshots_button.style.display =
  this.session.has_snapshots ? 'block' : 'none';
 this.sheet_div.appendChild(this.snapshots_button);
 
 // Introduction to the problem sheet
 this.intro_div = document.createElement('div');
 this.intro_div.className = 'sheet_intro';
 this.intro_div.innerHTML = this.problem_sheet.intro;
 this.sheet_div.appendChild(this.intro_div);
 MathJax.typeset([this.intro_div]);

 // The system is that question items may have subitems or they may
 // have things that directly require student response but not both.
 // The bottom_items array contains the items with no subitems.
 this.question_items = [];
 this.question_items_by_id = {};
 this.bottom_items = [];
 this.bottom_items_by_id = {};

 // The stage is an index for the bottom_items array.  It points to
 // the latest bottom item that is expanded.  
 var stage = 0;

 // The entries in this.problem_sheet.question_items are instances of
 // sangaku.question_item.  We promote them to instances of
 // sangaku.sheet_viewer.question_item before putting them in
 // this.question_items and similar arrays.
 for (item0 of this.problem_sheet.question_items) {
  var item = this.question_item.create(item0);
  item.session_id = this.session.id;
  item.student_id = this.student.id;
  this.question_items.push(item);
  this.question_items_by_id[item.id] = item;
  this.sheet_div.appendChild(item.create_dom(this));

  if (item.is_bottom) {
   this.bottom_items.push(item);
   this.bottom_items_by_id[item.id] = item;
   item.status_reports = [];
   item.uploads = [];
   item.uploads_by_id = {};
   item.latest_report = null;
   item.latest_status = sangaku.statuses[0];
   item.notify = false;
  }
 }

 // The server sends the full list of status reports for each question
 // item.  This is a bit redundant; it should probably be refactored
 // so that we only send the latest report.
 for (var r of this.student.status_reports) {
  var item = this.bottom_items_by_id[r.item_id];
  item.status_reports.push(r);
  item.latest_report = r;
  item.latest_status = sangaku.statuses[r.status_id];
  item.stepper.set_status_id(r.status_id);
  if (stage < item.bottom_index) {
   stage = item.bottom_index;
  }
 }
 
 for (var u of this.student.uploads) {
  var item = this.bottom_items_by_id[u.item_id];
  item.add_upload(u);
  if (stage < item.bottom_index) {
   stage = item.bottom_index;
  }
 }

 this.check_responded();

 for(item of this.bottom_items) {
  if (item.uploads) {
   item.upload_block.open();
  }
 }
 
 // We need to create some space at the bottom, to avoid various
 // pathologies.  There is a doubtless a better solution using
 // CSS styles without adding a spurious div.
 this.bottom_spacer = document.createElement('div');
 this.bottom_spacer.innerHTML = '&nbsp;';
 this.bottom_spacer.style['min-height'] = '50px';
 this.sheet_div.appendChild(this.bottom_spacer);

 // This div is used to display a notification to the student whenever
 // a teacher uploads a response to something that they have done.
 this.notifier = document.createElement('div');
 this.notifier.className = 'notifier';
 document.body.appendChild(this.notifier);
 this.notify_items = [];

 // The above code set the local variable stage to correspond to the
 // last item that has an associated status report or upload.  We now
 // record this local variable as a property, and adjust the DOM
 // accordingly.
 this.set_stage(stage);

 var me = this;
 // Make the notification go away when clicked.
 this.notifier.onclick = function() { me.clear_notifier(); };

 // Update the data after a five seconds (or the time specified by
 // this.interval, if that has been changed from five seconds).
 setTimeout(function() { me.update(); },me.interval);

 // This will start the countdown if the session has not started yet,
 // or display the questions if it has started.
 this.countdown();
};

sangaku.sheet_viewer.check_responded = function() {
 for (item of this.bottom_items) {
  item.last_access_time = 0;
  item.last_response_time = 0;
  if (item.latest_report) {
   item.last_access_time = Date.parse(item.latest_report.timestamp);
  }

  for (u of item.uploads) {
   var t = Date.parse(u.timestamp);
   if (u.teacher_id) {
    item.last_response_time = Math.max(item.last_response_time,t);
   } else {
    item.last_access_time = Math.max(item.last_access_time,t);
   }
  }

  if (item.last_response_time > item.last_access_time) {
   item.stepper.set_responded();
  }
 }
}

sangaku.sheet_viewer.question_item = {};

// This promotes an instance of sangaku.question_item to an instance of
// sangaku.sheet_viewer.question_item.  The point is that the latter
// has methods for manipulating the DOM, whereas the former does not.
sangaku.sheet_viewer.question_item.create = function(item) {
 var x = Object.create(this);
 Object.assign(x,item);
 x.header = item.auto_header();
 x.titled_header = item.titled_header();
 x.full_header = item.full_header();
 
 return x;
};

// Attached to each bottom level question item we will have an
// instance of sangaku.sheet_viewer.stepper.  This encapsulates the
// menu of possible statuses ("I am working on this" etc) and the
// associated DOM elements and event handlers.
sangaku.sheet_viewer.stepper = {};

sangaku.sheet_viewer.question_item.create_stepper = function(viewer) {
 var x = Object.create(sangaku.sheet_viewer.stepper);
 x.parent = viewer;
 this.stepper = x;
 
 x.session_id = this.session_id;
 x.student_id = this.student_id;
 x.item_id = this.id;
 x.stage = this.bottom_index;
 x.status = sangaku.statuses_by_code['not_started'];
 x.menu_open = false;
 
 x.container_div = document.createElement('div');
 x.container_div.className = 'stepper_container';
 this.control_div.appendChild(x.container_div);

 x.container_div.onmouseenter = function() { x.handle_mouseenter(); };
 x.container_div.onmouseout   = function() { x.handle_mouseout(); };
 
 x.option_divs = [];
 
 for (var i in sangaku.statuses) {
  var y = sangaku.statuses[i];
  var d = document.createElement('div');
  d.className = 'stepper_option';
  d.innerHTML = y.text;
  d.style.display = (i == 0) ? 'block' : 'none';
  d.peer = y;
  x.option_divs.push(d);
  x.container_div.appendChild(d);
  x.set_handlers(d);
 }

 this.control_div.appendChild(x.container_div);
 return(x);
};

sangaku.sheet_viewer.stepper.set_handlers = function(d) {
 var i = d.peer.id;
 var me = this;
 
 d.onmouseenter = function() { me.handle_status_mouseenter(i); }
 d.onclick = function() { me.handle_click(i); }
};

// Normally, only a div showing the current status is visible.
// When the mouse enters this, we expand the full menu of
// possible statuses.  There is special logic for the last
// possible status, indicating that a teacher has responded
// to the student.  Students do not select this status directly,
// it gets set automatically in appropriate circumstances.
sangaku.sheet_viewer.stepper.handle_mouseenter = function() {
 this.menu_open = true;

 for (j in this.option_divs) {
  var d = this.option_divs[j];
  if (d.peer.code == 'responded') {
   d.className = 'stepper_option_responded';
   if (d.peer.id == this.status_id) {
    d.style.display = 'block';
   } else {
    d.style.display = 'none';
   }
  } else {
   if (d.peer.id == this.status_id) {
    d.className = 'stepper_option_active';
   } else {
    d.className = 'stepper_option';
   }
   d.style.display = 'block';
  }
 }
};

// This should probably be deleted and the same effect produced
// using CSS :hover selectors.
sangaku.sheet_viewer.stepper.handle_status_mouseenter = function(i) {
 for (j in this.option_divs) {
  var d = this.option_divs[j];
  if (d.peer.code == 'responded') {
   d.className = 'stepper_option_responded';
   if (d.peer.id == this.status_id) {
    d.style.display = 'block';
   } else {
    d.style.display = 'none';
   }
  } else {
   if (d.peer.id == i) {   
    d.className = 'stepper_option_active';
   } else {
    d.className = 'stepper_option';
   }
   d.style.display = 'block';
  }
 }
};

// When we set the item status, we rotate the other possible statuses
// cyclically so that the selected status appears at the top of the list.
sangaku.sheet_viewer.stepper.set_status_id = function(i) {
 this.menu_open = false;

 var extra = [];
 var found = false;
 var c = this.container_div;
 
 for (j in this.option_divs) {
  var d = this.option_divs[j];
  d.className = d.peer.code == 'responded' ? 'stepper_option_responded' : 'stepper_option';

  if (found) {
   d.style.display = 'none';
  } else if (d.peer.id == i) {
   d.style.display = 'block';
   found = true;
   this.status = d.peer;
  } else {
   d.style.display = 'none';
   c.removeChild(d);
   extra.push(d);
  }
 }

 for (j in extra) {
  c.appendChild(extra[j]);
 }
};

// Set the status to indicate that a teacher has responded
sangaku.sheet_viewer.stepper.set_responded = function() {
 this.set_status_id(7);
};

// This method sets the status of an item, informs the server of the new
// status, and advances to the next question if the new status indicates
// that that is required.
sangaku.sheet_viewer.stepper.handle_click = function(i) {
 this.menu_open = false;

 this.set_status_id(i);
 if (this.status.action == 'step') {
  this.parent.set_stage(Math.max(this.parent.stage,this.stage + 1));
 }

 var url = '/sangaku/ajax/record_status.php' +
     '?session_id=' + this.session_id +
     '&item_id=' + this.item_id +
     '&student_id=' + this.student_id +
     '&status_id=' + i;

 fetch(url).then(response => console.log(response));
};

// If the mouse leaves the status menu then we hide it and just display
// the current status.
sangaku.sheet_viewer.stepper.handle_mouseout = function() {
 this.menu_open = false;

 for (j in this.option_divs) {
  var d = this.option_divs[j];
  if (d.peer.code == 'responded') {
   d.className = 'stepper_option_responded';
  } else {
   d.className = 'stepper_option';
  }

  if (d.peer.id == this.status.id) {
   d.style.display = 'block';
  } else {
   d.style.display = 'none';
  }
 }
};

sangaku.sheet_viewer.question_item.add_upload = function(u) {
 this.uploads.push(u);
 this.uploads_by_id[u.id] = u;
 u.create_dom();
 u.item = this;
 this.upload_block.reviews_div.appendChild(u.div);
 MathJax.typeset([u.div]);
};

sangaku.sheet_viewer.question_item.modify_upload = function(u) {
 var u0 = this.uploads_by_id[u.id];
 u0.munch(u);
 u0.update_dom();
 MathJax.typeset([u0.div]);
};

sangaku.sheet_viewer.question_item.remove_upload = function(id) {
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
};

sangaku.sheet_viewer.question_item.create_dom = function(viewer) {
 this.viewer = viewer;
 this.div = document.createElement('div');
 this.div.style.display = 'none';
 this.div.innerHTML = this.problem;
 MathJax.typeset([this.div]);
 this.h = document.createElement('h' + (1 + this.level));
 this.h.innerHTML = this.titled_header + ' ';
 if (this.div.hasChildNodes) {
  this.div.insertBefore(this.h,this.div.childNodes[0]);
 } else {
  this.div.appendChild(this.h)
 }

 this.solution_div = document.createElement('div');
 this.solution_div.className = 'item_review_solution';
 if (this.solution) {
  this.solution_div.innerHTML = '<b>Solution:</b> ' + this.solution;
  MathJax.typeset([this.solution_div]);
 } else {
   this.solution_div.style.display = 'none';
 }
 this.div.appendChild(this.solution_div);

 if (this.is_bottom) {
  this.control_div = document.createElement('div');
  this.control_div.className = 'control';
  this.div.appendChild(this.control_div);
  this.upload_block =
   sangaku.create_upload_block(
    this.session_id,
    this.student_id,
    this,
    false
   );
  this.control_div.appendChild(this.upload_block.button_div);
  this.div.appendChild(this.upload_block.panel_div);
  this.create_stepper(viewer);
 }

 return this.div;
};

sangaku.sheet_viewer.show_error = function(x) {
 var d = document.createElement('div');
 d.innerHTML = 'error fetching data';
 
 document.body.appendChild(d);
 console.log(x);
};

sangaku.sheet_viewer.set_stage = function(s) {
 var s0 = s;
 if (s0 < 0) { s0 = 0; }
 if (s0 >= this.bottom_items.length) {
  s0 = this.bottom_items.length - 1;
 }

 this.stage = s0;
 var x = this.bottom_items[s0];
 var i = x.item_index;

 for (j in this.question_items) {
  var y = this.question_items[j];
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

sangaku.sheet_viewer.update = function() {
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

sangaku.sheet_viewer.update_data = function(x) {
 this.new_stage = this.stage;

 if (x.has_snapshots) {
  this.session.has_snapshots = 1;
  this.snapshots_button.style.display = 'block';
 }

 for (var item0 of x.problem_sheet.question_items) {
  if (item0.solution) {
   var item = this.question_items_by_id[item0.id];
   item.solution = item0.solution;
   item.solution_div.innerHTML = '<b>Solution:</b> ' + item.solution;
   MathJax.typeset([item.solution_div]);
   item.solution_div.style.display = 'block';
  }
 }

 for (var item of this.bottom_items) {
  item.new_report = null;
  item.new_uploads = [];
  item.modified_uploads = [];
  item.notify_uploads = [];
  for (u of item.uploads) { u.seen = false; }
 }

 for (var r of x.student.status_reports) {
  var item = this.bottom_items_by_id[r.item_id];
  this.new_stage = Math.max(this.new_stage,item.bottom_index);
  if (! item.latest_report || Date.parse(r.timestamp) > Date.parse(item.latest_report.timestamp)) {
   item.new_report = r;
   item.latest_report = r;
  }
 }

 for (u0 of x.student.uploads) {
  var item = this.bottom_items_by_id[u0.item_id];
  this.new_stage = Math.max(this.new_stage,item.bottom_index);
  var u1 = item.uploads_by_id[u0.id];
  if (u1) {
   u1.seen = true;
   if (Date.parse(u0.timestamp) > Date.parse(u1.timestamp)) {
    item.modified_uploads.push(u0);
    if (u0.teacher_id) {
     item.notify = true;
    }
   }
  } else {
   item.new_uploads.push(u0);
   u0.seen = true;
   if (u0.teacher_id) {
    item.notify = true;
   }
  }
 }

 this.notify_items = [];
 
 for (item of this.bottom_items) {
  if (item.new_report) {
   item.stepper.set_status_id(item.new_report.status_id);
  }

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

  if (item.notify) {
   this.notify_items.push(item);
  }
 }

 if (this.notify_items.length) {
  var msg = 'New responses for ';
  var c = '';
  for (item of this.notify_items) {
   msg = msg + c + item.full_header;
   c = ',';
  }
  msg = msg + '.';
  this.notifier.innerHTML = msg;
  this.notifier.style.display = 'block';
 } else {
  this.notifier.innerHTML = '';
  this.notifier.style.display = 'none';
 }

 this.check_responded();
};

sangaku.sheet_viewer.clear_notifier = function() {
 for (item of this.bottom_items) {
  item.notify = false;
 }
 this.notifier.innerHTML = '';
 this.notifier.style.display = 'none';
};

sangaku.sheet_viewer.countdown = function() {
 var dd = this.session.start_time;
 var t0 = this.session.start_timestamp * 1000;
 var t1 = Date.now();
 var d0 = (new Date(t0)).toISOString();
 var d1 = (new Date(t1)).toISOString();
 var w = t0 - t1;
 this.wait = w;
 var me = this;
 var cd = this.countdown_div;
 var sd = this.sheet_div;
 
 if (w < 0 || (this.student.username.length >= 4 && this.student.username.substr(0,4) == 'fake')) {
  cd.style.display = 'none';
  sd.style.display = 'block';
 } else if (w < 10 * 60 * 1000) {
  var min = Math.floor(w / (60 * 1000));
  var sec = Math.floor((w - 60 * 1000 * min) / 1000);
  var min0,sec0;
  if (min < 10) { min0 = '0' + min; } else { min0 = '' + min; } 
  if (sec < 10) { sec0 = '0' + sec; } else { sec0 = '' + sec; }
  cd.innerHTML = "This session will start in " + min0 + ':' + sec0;
  cd.style.display = 'block';
  sd.style.display = 'none';

  setTimeout(function() {me.countdown(),1000} );
 } else if (w < 24 * 3600 * 1000) {
  var d = new Date(this.session.start_timestamp * 1000);
  var h = d.getHours();
  var m = d.getMinutes();
  var h0,m0;
  if (h < 10) { h0 = '0' + h; } else { h0 = '' + h; }
  if (m < 10) { m0 = '0' + m; } else { m0 = '' + m; }

  cd.innerHTML = "This session will start at " + h0 + ":" + m0;
  cd.style.display = 'block';
  sd.style.display = 'none';
  
  setTimeout(function() {me.countdown(),10000} );
 } else {
  cd.innerHTML = "This session does not open today. ";
  cd.style.display = 'block';
  sd.style.display = 'none';
 }
}
