sangaku.show_uploads = {};

sangaku.show_uploads.init = function() {
 this.tabs = [];
 this.tabs_by_item_id = {};
 
 var tabs_ = document.evaluate(".//button[@class='tablinks']",document);
 var tab_ = tabs_.iterateNext();

 var l = "tab_button_".length;
 
 while(tab_) {
  tab = {};
  tab.button = tab_;
  tab.button_id = tab_.id;
  tab.item_id = tab_.id.substring(l);
  tab.panel_id = 'tab_' + tab.item_id;

  tab.panel = document.getElementById(tab.panel_id);
  
  this.tabs.push(tab);
  this.tabs_by_item_id[tab.item_id] = tab;
  this.set_tab_handler(tab);

  tab_ = tabs_.iterateNext();
 }
};

sangaku.show_uploads.select_tab = function(item_id) {
 for (var t of this.tabs) {
  if (t.item_id == item_id) {
   t.button.className = 'tablinks active';
   t.panel.style.display = 'block';
  } else {
   t.button.className = 'tablinks';
   t.panel.style.display = 'none';
  }
 }
};

sangaku.show_uploads.set_tab_handler = function(tab) {
 var me = this;
 
 tab.button.onclick = function() {
  me.select_tab(tab.item_id)
 }
};

sangaku.show_uploads.upload_block = {
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

sangaku.show_uploads.upload_block.configure_child = function(child) {
 child.session_id = this.session_id;
 child.student_id = this.student_id;
 child.item_id    = this.item_id;
 child.secret     = this.secret;
 return child;
};

sangaku.show_uploads.create_upload_block =
 function(session_id,student_id,secret,item_id) {
  var u = Object.create(this.upload_block);
  u.session_id = session_id;
  u.student_id = student_id;
  u.secret     = secret;
  u.item_id    = item_id;
  
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

sangaku.show_uploads.upload_block.select_tab = function(k) {
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

sangaku.show_uploads.upload_block.set_tab_handler = function(k) {
 var me = this;
 this[k].tab_button.onclick = function() { me.select_tab(k); };
};
