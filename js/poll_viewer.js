// UNFINISHED

sangaku.poll_viewer = {
 stage : 0,
 interval : 5000, // update inteval in milliseconds
 message_for_status = {
  'before' : 'This poll has not been revealed yet.',
  'revealed' : 'You cannot respond to this poll yet.',
  'open' : 'You can respond to this poll now.',
  'closed' : 'This poll has now closed.'
 }
};

// This function loads information about the instance and student
// from the page ajax/get_instance_student.php.  More precisely,
// this function returns immediately but sets things up via promises 
// to ensure that the functions sangaku.instance.scrunch() and then
// sangaku.poll_viewer.init_data() will be called to process the
// information when it is received from the server.
sangaku.poll_viewer.init = function(instance_id,student_id) {
 var me = this;
 
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
 this.poll_div.style.display = 'none';
 document.body.appendChild(this.poll_div);

 this.h1 = document.createElement('h1');
 var title = this.poll.title;
 if (! title) { title = 'Poll ' + this.poll.id; }
 this.h1.innerHTML = title;
 this.poll_div.appendChild(this.h1);
 MathJax.typeset([this.h1]);

 this.status_div = document.createElement('div');
 this.status_div.className = 'poll_status';
 this.status_div.innerHTML = this.message_for_status[poll.status];
 this.poll_div.appendChild(this.status_div);

 this.intro_div = document.createElement('div');
 this.intro_div.className = 'poll_intro';
 if (poll.status == 'before') {
  this.intro_div.style.display = 'none';
 }
 this.poll_div.appendChild(this.intro_div);

 this.items_div = document.createElement('div');
 this.items_div.className = 'poll_items';
 if (poll.status == 'before') {
  this.items_div.style.display = 'none';
 }
 this.poll_div.appendChild(this.items_div);

 this.items_table = document.createElement('table');
 this.items_div.appendChild(this.items_table);

 this.items_tbody = document.createElement('tbody');
 this.items_table.appendChild(this.items_tbody);
 
 for (var item of poll.items) {
  item.tr = document.createElement('tr');
  item.tr.className = 'poll_item';
  item.box_td = document.createElement('td');
  item.box_td.className = 'poll_item_box';
  item.tr.appendChild(item.box_td);
  item.box = document.createElement('input');
  item.box_td.appendChild(item.box);
  item.box.id = 'select_item_' + item.id;
  if (poll.status != 'open') {
   item.box.disabled = 1;
  }
  if (poll.multiple) {
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
};

sangaku.poll_viewer.set_status = function(status) {
 if (status != 'revealed' && status != 'open' && status != 'closed') {
  status = 'before';
 }

 this.poll.status = status;

 this.status_div.innerHTML = this.message_for_status[status];
 
 if (status == 'before') {
  this.intro_div.style.display = 'none';
  this.items_div.style.display = 'none';
 } else if (status == 'revealed' || status == 'closed') {
  this.intro_div.style.display = 'block';
  this.items_div.style.display = 'block';
  for (var item of this.poll.items) {
   item.box.disabled = 1;
  }
 } else {
  this.intro_div.style.display = 'block';
  this.items_div.style.display = 'block';
  for (var item of this.poll.items) {
   item.box.disabled = 0;
  }
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
   var y = sangaku.instance.scrunch(x);
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
 this.set_status(x.poll.status);
};

