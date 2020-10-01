sangaku.problem_sheet = {};

sangaku.problem_sheet.init = function() {
 var questions_ = document.evaluate(".//div[@class='question']",
				    document,null,
				    XPathResult.ORDERED_NODE_ITERATOR_TYPE);
 this.items = [];
 this.bottom_items = [];
 this.questions = [];

 var question_ = questions_.iterateNext();
 var question = null;

 while(question_) {
  question = Object.create(sangaku.question);
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
   var part = Object.create(sangaku.part);
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
    var subpart = Object.create(sangaku.subpart);
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

 for (x of this.items) {
  x.id = this.item_ids[x.full_header];
 }
 
 for (x of this.bottom_items) {
  x.control_div = document.createElement('div');
  x.control_div.className = 'control';
  x.div.appendChild(x.control_div);

  x.upload_block =
   this.create_upload_block(this.session_id,
                            this.student_id,
                            this.secret,
                            x.id);

  x.control_div.appendChild(x.upload_block.button_div);
  x.div.appendChild(x.upload_block.panel_div);
  
  x.stepper = this.create_stepper(x);
 }

 this.set_stage(0);
 var x = this.bottom_items[this.stage];
 x.stepper.handle_click(1); 
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

sangaku.problem_sheet.upload_block = {
 session_id : null,
 student_id : null,
 item_id : null,
 secret : null,
 tabs : [['Type','type_uploader'],
         ['Webcam','camera_uploader'],
         ['Phone','phone_uploader'],
         ['File','file_uploader'],
         ['Review','reviewer']]
};

sangaku.problem_sheet.upload_block.configure_child = function(child) {
 child.session_id = this.session_id;
 child.student_id = this.student_id;
 child.item_id    = this.item_id;
 child.secret     = this.secret;
 return child;
};

sangaku.problem_sheet.create_upload_block =
 function(session_id,student_id,secret,item_id) {
  var u = Object.create(this.upload_block);
  u.session_id = session_id;
  u.student_id = student_id;
  u.secret     = secret;
  u.item_id    = item_id;
  
  u.state = 'closed';
  u.button_div = document.createElement('div');
  u.button_div.className = 'upload_block_button';
  u.button_div.innerHTML = 'Show my work to the teacher';
  
  var d = document.createElement('div');
  u.panel_div = d;
  d.className = 'upload_block';
  d.style.display = 'none';
  
  var td = document.createElement('div');
  u.tab_div = td;
  td.className = 'tab';
  d.appendChild(td);
  
  for (var x of u.tabs) {
   var k = x[1];
   u[k] = u.configure_child(Object.create(sangaku[k]));
   u[k].create_dom();
   u[k].tab_button = document.createElement('button');
   u[k].tab_button.className = 'tablinks';
   u[k].tab_button.innerHTML = x[0];
   td.appendChild(u[k].tab_button);
   u[k].div.className = 'tabcontent';
   d.appendChild(u[k].div);
   u.set_tab_handler(k);
  }

  u.type_uploader.review_div = u.reviewer.div;
  u.camera_uploader.review_div = u.reviewer.div;
  u.file_uploader.review_div = u.reviewer.div;
  
  u.button_div.onclick = function() { u.toggle(); }
  u.select_tab('type_uploader');
  
  return u;
 };

sangaku.problem_sheet.upload_block.toggle = function() {
 if (this.state == 'closed') {
  this.state = 'open';
  this.button_div.innerHTML = 'Hide';
  this.panel_div.style.display = 'block';
 } else {
  this.state = 'closed';
  this.button_div.innerHTML = 'Show my work to the teacher';
  this.panel_div.style.display = 'none';  
 }
};

sangaku.problem_sheet.upload_block.select_tab = function(k) {
 for (var x of this.tabs) {
  var l = x[1];
  var u = this[l];
  if (l == k) {
   u.tab_button.className = 'tablinks active';
   u.div.style.display = 'block';
  } else {
   u.tab_button.className = 'tablinks';
   u.div.style.display = 'none';
  }
 }

 if (this[k].startup instanceof Function) {
  this[k].startup();
 }
};

sangaku.problem_sheet.upload_block.set_tab_handler = function(k) {
 var me = this;
 this[k].tab_button.onclick = function() { me.select_tab(k); };
};
