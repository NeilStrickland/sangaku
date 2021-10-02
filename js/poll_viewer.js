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

 this.instance.create_dom(this.poll_div);

 this.instance.submit_button.onclick =
  function() { me.submit_response(); }

 this.set_state(this.instance.state);
 
 MathJax.typeset([this.poll_div]);

 setTimeout(function() { me.update(); },me.interval);
};

sangaku.poll_viewer.set_state = function(state) {
 if (! (state in this.instance.message_for_state)) {
  state = 'before';
 }

 this.instance.state = state;

 var opts = {
  show             : 0,
  show_title       : 0,
  show_content     : 0,
  show_intro       : 0,
  show_items       : 0,
  show_count       : 0,
  show_results     : 0,
  show_correctness : 0,
  show_state       : 0,
  show_button      : 0,
  enable           : 0
 };

 if (! (state == 'before' || state == 'after')) {
  opts.show = 1;
  opts.show_title = 1;
  opts.show_content = 1;
  opts.show_intro = 1;
  opts.show_items = 1;
  opts.show_state = 1;
  opts.enable = (state == 'reveal' || state == 'open') ? 1 : 0;
  opts.show_button = (state == 'open') ? 1 : 0;
  opts.show_results = (state == 'results' || state == 'correct') ? 1 : 0;
  opts.show_correctness = (state == 'correct') ? 1 : 0;
 }

 this.instance.set_dom_opts(opts);
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
 if (x.state == 'count' || x.state == 'correct') {
  if ('total_count' in x) {
   this.poll.total_count = parseInt(x.total_count);

   for (var item0 of x.poll.items) {
    if (! (item0.id in this.poll.items_by_id)) { continue; }
    var item = this.poll.items_by_id[item0.id];

    item.count = ('count' in item0) ? item0.count : 0;
    if (this.poll.total_count > 0) {
     w = Math.round(400 * item.count / this.poll.total_count);
     item.count_bar.style.width = '' + w + 'px';
     item.count_box.innerHTML =
      '' + item.count + '/' + this.poll.total_count;
    } else {
     item.count_bar.style.width = '1px';
     item.count_box.innerHTML = '0/0';
    }
   }
  }
 }
 
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
  function(x) {
   me.submit_button.className = 'poll_submitted';
  }
 ); 
}

sangaku.poll_viewer.show_error = function(x) {
 var d = document.createElement('div');
 d.innerHTML = 'error fetching data';
 
 document.body.appendChild(d);
 console.log(x);
};
