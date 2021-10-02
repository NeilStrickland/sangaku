sangaku.poll_display = {};

sangaku.poll_display.init = function(poll_id) {
 var me = this;
 
 var url = '/sangaku/ajax/db.php?object_type=poll&' +
     'command=full_load&id=' + poll_id;
 
 fetch(url).then(
  response => response.json()
 ).then(
  x => me.init_data(sangaku.poll.scrunch(x))
 ).catch(
  x => me.show_error(x)
 )
};

// Here x will be an instance of sangaku.poll_instance constructed
// in such a way that x.student and x.poll are instances of
// sangaku.student and sangaku.poll.
sangaku.poll_display.init_data = function(x) {
 var me = this;
 
 this.instance = Object.create(sangaku.poll_instance);
 this.instance.poll = x;
 this.poll_div = document.getElementById('poll_div');
 this.instance.create_dom(this.poll_div);

 var opts = {
  show             : 1,
  show_title       : 0,
  show_content     : 1,
  show_intro       : 1,
  show_items       : 1,
  show_count       : 0,
  show_results     : 0,
  show_correctness : 0,
  show_state       : 0,
  show_button      : 0,
  enable           : 0
 };

 this.instance.set_dom_opts(opts);
};

sangaku.poll_display.show_error = function(x) {
 var d = document.createElement('div');
 d.innerHTML = 'error fetching data';
 
 document.body.appendChild(d);
 console.log(x);
};
