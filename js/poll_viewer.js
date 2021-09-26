sangaku.poll_viewer = {
 stage : 0,
 interval : 5000 // update inteval in milliseconds
};

// This function loads information about the instance and student
// from the page ajax/get_instance_student.php.  More precisely,
// this function returns immediately but sets things up via promises 
// to ensure that the functions sangaku.poll_instance.scrunch() and then
// sangaku.poll_viewer.init_data() will be called to process the
// information when it is received from the server.
sangaku.poll_viewer.init = function(instance_id,student_id) {
 var me = this;
 
 this.message_for_state = {};
 this.message_for_state['before'  ] = 'This poll has not been revealed yet.';
 this.message_for_state['revealed'] = 'You cannot respond to this poll yet.';
 this.message_for_state['open'    ] = 'You can respond to this poll now.';
 this.message_for_state['closed'  ] = 'This poll has now closed.';

 var url = '/sangaku/ajax/get_instance_student.php' +
     '?instance_id=' + instance_id + '&student_id=' + student_id;
 
 fetch(url).then(
  response => response.json()
 ).then(
  x => me.init_data(sangaku.poll_instance.scrunch(x))
 ).catch(
  x => me.show_error(x)
 )
};

// Here x will be an instance of sangaku.poll_instance constructed
// in such a way that x.student and x.poll are instances of
// sangaku.student and sangaku.poll.
sangaku.poll_viewer.init_data = function(x) {
 var me = this;
 
 this.instance = x;
 this.student = x.student;
 this.poll = x.poll;

 // The main div 
 this.poll_div = document.createElement('div');
 document.body.appendChild(this.poll_div);

 this.h1 = document.createElement('h1');
 var title = this.poll.title;
 if (! title) { title = 'Poll ' + this.poll.id; }
 this.h1.innerHTML = title;
 this.poll_div.appendChild(this.h1);

 this.intro_div = document.createElement('div');
 this.intro_div.className = 'poll_intro';
 if (this.instance.state == 'before') {
  this.intro_div.style.display = 'none';
 }
 this.intro_div.innerHTML = this.poll.intro;
 this.poll_div.appendChild(this.intro_div);

 this.items_div = document.createElement('div');
 this.items_div.className = 'poll_items';
 if (this.instance.state == 'before') {
  this.items_div.style.display = 'none';
 }
 this.poll_div.appendChild(this.items_div);

 this.items_table = document.createElement('table');
 this.items_div.appendChild(this.items_table);

 this.items_tbody = document.createElement('tbody');
 this.items_table.appendChild(this.items_tbody);
 
 for (var item of this.poll.items) {
  item.tr = document.createElement('tr');
  item.tr.className = 'poll_item';
  item.box_td = document.createElement('td');
  item.box_td.className = 'poll_item_box';
  item.tr.appendChild(item.box_td);
  item.box = document.createElement('input');
  item.box_td.appendChild(item.box);
  item.box.id = 'select_item_' + item.id;
  if (this.instance.state != 'open') {
   item.box.disabled = 1;
  }
  if (this.poll.multiple) {
   item.box.type = 'checkbox';
   item.box.name = 'select_item_' + item.id;
  } else {
   item.box.type = 'radio';
   item.box.name = 'select_item';
  }
  item.text_td = document.createElement('td');
  item.text_td.className = 'poll_item_text';
  item.text_td.innerHTML = item.text;
  item.tr.appendChild(item.text_td);
  this.items_tbody.appendChild(item.tr);
 }

 this.state_div = document.createElement('div');
 this.state_div.className = 'poll_state';
 this.state_div.innerHTML = this.message_for_state[this.instance.state];
 this.poll_div.appendChild(this.state_div);

 this.submit_button = document.createElement('button');
 this.submit_button.type = 'button';
 this.submit_button.className = 'poll_submit';
 this.submit_button.innerHTML = 'Submit response';
 this.submit_button.onclick = function() { me.submit_response(); }
 if (this.instance.state != 'open') {
  this.submit_button.style.display = 'none';
 }
 this.poll_div.appendChild(this.submit_button);
 
 MathJax.typeset([this.poll_div]);

 setTimeout(function() { me.update(); },me.interval);
};

sangaku.poll_viewer.set_state = function(state) {
 if (state != 'revealed' && state != 'open' && state != 'closed') {
  state = 'before';
 }

 this.instance.state = state;

 this.state_div.innerHTML = this.message_for_state[state];
 
 if (state == 'before') {
  this.intro_div.style.display = 'none';
  this.items_div.style.display = 'none';
  this.submit_button.style.display = 'none';
 } else if (state == 'revealed' || state == 'closed') {
  this.intro_div.style.display = 'block';
  this.items_div.style.display = 'block';
  for (var item of this.poll.items) {
   item.box.disabled = 1;
  }
  this.submit_button.style.display = 'none';
 } else {
  this.intro_div.style.display = 'block';
  this.items_div.style.display = 'block';
  for (var item of this.poll.items) {
   item.box.disabled = 0;
  }
  this.submit_button.style.display = 'inline';
 }
}

sangaku.poll_viewer.update = function() {
 var me = this;
 
 var url = '/sangaku/ajax/get_instance_student.php' +
     '?instance_id=' + this.instance.id + '&student_id=' + this.student.id;
 
 fetch(url).then(
  response => response.json()
 ).then(
  function(x) {
   var y = sangaku.poll_instance.scrunch(x);
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

sangaku.poll_viewer.update_data = function(x) {
 this.set_state(x.state);
};

sangaku.poll_viewer.submit_response = function() {
 var me = this;
 var response = null;
 
 if (this.poll.is_multiple) {
  response = [];
  for (var item of this.poll.items) {
   if (item.box.checked) { response.push(item.id); }
  }
  response = JSON.stringify(response);
 } else {
  response = 0;
  for (var item of this.poll.items) {
   if (item.box.checked) { response = item.id; }
  }
 }
 
 var url = '/sangaku/ajax/submit_response.php' +
     '?instance_id=' + this.instance.id +
     '&student_id=' + this.student.id +
     '&response=' + response;
 
 fetch(url).then(
  x => me.submit_button.className = 'poll_submitted';
 ) 
}

sangaku.poll_viewer.show_error = function(x) {
 var d = document.createElement('div');
 d.innerHTML = 'error fetching data';
 
 document.body.appendChild(d);
 console.log(x);
};
