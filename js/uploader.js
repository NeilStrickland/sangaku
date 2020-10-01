sangaku.uploader = {
 source : null,
 student_id : null,
 item : null
};

sangaku.uploader.upload = function() {
 var me = this;

 var data = new FormData();

 var item_id;
 if (this.item) {
  item_id = this.item.id;
 } else {
  item_id = this.item_id;
 }
 
 data.append('session_id',this.session_id);
 data.append('student_id',this.student_id);
 data.append('item_id'   ,item_id);
 data.append('source'    ,this.source);
 data.append('content'   ,this.get_content());

 if (this.teacher_id) {
  data.append('teacher_id',this.teacher_id);
 }
 
 me.pre_upload_hook(data);
 var url = '/sangaku/ajax/upload.php';
 var b = this.upload_button;
 b.innerHTML = 'Uploading...';
 fetch(url, {method : 'POST',
             body : data}).
  then(response => response.json()).
  then(function(u0) {
   var u = sangaku.upload.scrunch(u0);
   if (me.item) { me.item.add_upload(u); }
   me.post_upload_hook();
  });
};

sangaku.uploader.get_content = function() {
 console.log('Error - method should be overridden');
};

sangaku.uploader.insert_review = function(div,upload_id) {
 console.log('Error - method should be overridden');
};

sangaku.uploader.pre_upload_hook = function() {};
sangaku.uploader.post_upload_hook = function() {};
sangaku.uploader.startup = function() {};
 
//////////////////////////////////////////////////////////////////////

sangaku.type_uploader = Object.create(sangaku.uploader);

sangaku.type_uploader.source = 'type';

sangaku.type_uploader.create_dom = function() {
 var me = this;
 var d = document.createElement('div');
 this.div = d;
 
 d.innerHTML =
  "You can use this tab to type in your working (or use one of the other " +
  "tabs to upload a picture or a file instead).  If you know LaTeX, " +
  "you can click the Σ button to enter mathematical expressions.<br/>";

 var a = document.createElement('textarea');
 this.textarea = a;
 d.appendChild(a);

 this.editor = null;
 
 var b = document.createElement('button');
 b.style.display = 'inline-block';
 d.appendChild(b);
 b.innerHTML = 'Upload';
 this.upload_button = b;
 b.onclick = function() { me.upload(); };
};

sangaku.type_uploader.startup = function() {
 if (! this.editor) {
  var mjl0 = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML';
  var mjl1 = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
 
  this.editor = CKEDITOR.replace(this.textarea,{mathJaxLib : mjl0});
 }
};

sangaku.type_uploader.get_content = function() {
 this.content = this.editor.getData();
 return this.content;
};

sangaku.type_uploader.post_upload_hook = function() {
 this.upload_button.innerHTML = 'Upload';
 this.editor.setData('');
};

sangaku.type_uploader.insert_review = function(div,upload_id) {
 div.innerHTML = this.content;
 MathJax.typeset([div]);
};

//////////////////////////////////////////////////////////////////////

sangaku.camera_uploader = Object.create(sangaku.uploader);

sangaku.camera_uploader.source = 'camera';
sangaku.camera_uploader.width  = 640;
sangaku.camera_uploader.height = 0;
sangaku.camera_uploader.state  = 'unstarted';
sangaku.camera_uploader.streaming = false;

sangaku.camera_uploader.add_button = function(key,text) {
 var b = document.createElement('button');
 b.style.display = 'none';
 this.div.appendChild(b);
 b.innerHTML = text;
 this.buttons[key] = b;
 return b; 
};

sangaku.camera_uploader.show_buttons = function(keys) {
 for (var key in this.buttons) {
  var b = this.buttons[key];
  if (keys.includes(key)) {
   b.style.display = 'inline-block';
  } else {
   b.style.display = 'none';
  }
 }
};

sangaku.camera_uploader.create_dom = function() {
 var me = this;
 var d = document.createElement('div');
 this.div = d;
 
 var cd = document.createElement('div');
 cd.className = 'camera';
 this.div.appendChild(cd);
 this.camera_div = cd;

 var v = document.createElement('video');
 v.innerHTML = 'Video stream not available';
 cd.appendChild(v);
 this.video = v;
 
 var w = document.createElement('canvas');
 w.style.display = 'none';
 cd.appendChild(w);
 this.canvas = w;

 var i = document.createElement('img');
 i.style.display = 'none';
 cd.appendChild(i);
 this.img = i;

 this.buttons = {};
 this.add_button('snap','Take picture').onclick =
  function() { me.snap(); };
 this.add_button('discard','Discard').onclick =
  function() { me.discard(); };
 this.add_button('upload','Upload').onclick =
  function() { me.upload(); };
 this.add_button('new','New picture').onclick =
  function() { me.new() };

 this.upload_button = this.buttons.upload;
};

sangaku.camera_uploader.startup = function() {
 if (this.state != 'unstarted') {
  return null;
 }
 
 var me = this;

 this.state = 'waiting';

 var opts = {
  video: {facingMode : 'environment' },
  audio: false
 };

 var n = navigator;
 var m = false;
 if (n) { m = n.mediaDevices; }
 if (!m) {
  this.camera_div.innerHTML = 'No camera available';
  return false;
 }
 
 m.getUserMedia(opts)
  .then(function(stream) {
   me.video.srcObject = stream;
   me.video.play();
  })
  .catch(function(err) {
   this.camera_div.innerHTML = 'No camera available';
   console.log("An error occurred: " + err);
   return false;
  });

 this.video.addEventListener('canplay', function(ev){
  if (! me.streaming) {
   me.height = this.videoHeight / (this.videoWidth/me.width);
   
   this.setAttribute('width', me.width);
   this.setAttribute('height', me.height);
   me.canvas.setAttribute('width', me.width);
   me.canvas.setAttribute('height', me.height);
   me.streaming = true;
   me.state = 'streaming';
   me.show_buttons(['snap']);
  }
 }, false);

 return true;
};

sangaku.camera_uploader.clear_img = function() {
 var context = this.canvas.getContext('2d');
 context.fillStyle = '#FFFFFF';
 context.fillRect(0,0,this.canvas.width,this.canvas.height);
 this.content = this.canvas.toDataURL('image/png');
 this.img.setAttribute('src',this.content);
};

sangaku.camera_uploader.snap = function() {
 var context = this.canvas.getContext('2d');
 if (this.width && this.height) {
  this.canvas.width = this.width;
  this.canvas.height = this.height;
  context.drawImage(this.video,0,0,this.width,this.height);
  this.content = this.canvas.toDataURL('image/png');
  this.img.setAttribute('src',this.content);
  this.video.style.display = 'none';
  this.img.style.display = 'block';
  this.state = 'review';
  this.show_buttons(['discard','upload']);
 } else {
  this.clear_img();
  this.state = 'streaming';
  this.video.style.display = 'block';
  this.img.style.display = 'none';
  this.show_buttons(['snap']);
 }
};

sangaku.camera_uploader.discard = function() {
 this.clear_img();
 this.state = 'streaming';
 this.video.style.display = 'block';
 this.img.style.display = 'none';
 this.show_buttons(['snap']);
};

sangaku.camera_uploader.get_content = function() {
 this.content = this.canvas.toDataURL('image/png');
 return this.content;
};

sangaku.camera_uploader.post_upload_hook = function() {
 this.state = 'review';
 this.show_buttons(['new']);
 this.camera_div.style.display = 'none';
};

sangaku.camera_uploader.new = function() {
 this.clear_img();
 this.state = 'streaming';
 this.camera_div.style.display = 'block';
 this.video.style.display = 'block';
 this.img.style.display = 'none';
 this.show_buttons(['snap']);
};

sangaku.camera_uploader.insert_review = function(div,upload_id) {
 var i = document.createElement('img');
 div.appendChild(i);
 i.style.width = '100%';
 i.src = this.content;
};

//////////////////////////////////////////////////////////////////////

sangaku.file_uploader = Object.create(sangaku.uploader);

sangaku.file_uploader.source = 'file';

sangaku.file_uploader.create_dom = function() {
 var me = this;
 var d = document.createElement('div');
 this.div = d;

 d.appendChild(
  this.file_input = document.createElement('input')
 );

 this.file_input.setAttribute('type','file');
 this.upload_button = document.createElement('button');
 this.upload_button.innerHTML = 'Upload';
 this.upload_button.onclick = function() {
  me.upload();
 };

 d.appendChild(this.upload_button);
};

sangaku.file_uploader.pre_upload_hook = function(data) {
 data.append('upload_file',this.file_input.files[0]);
};

sangaku.file_uploader.post_upload_hook = function() {
 this.upload_button.innerHTML = 'Upload';
 this.file_input.value = '';
};

sangaku.file_uploader.insert_review = function(div,upload_id) {
 var f = document.createElement('iframe');
 f.style.width = '640px';
 div.appendChild(f);
 f.src = '/sangaku/ajax/download.php?upload_id=' + upload_id;
 f.onload = function() {
  var s = f.src;
  var b = f.contentWindow.document.body;
  var h = b.scrollHeight;
  if (h) { f.style.height = h + 'px'; }
 };
};

//////////////////////////////////////////////////////////////////////

sangaku.phone_uploader = {
 student_id : null,
 item_ : null
};

sangaku.phone_uploader.create_dom = function() {
 var me = this;
 var d = document.createElement('div');
 this.div = d;

 d.innerHTML =
  "Scan the QR code with your phone to be taken to a page where " +
  "you can upload a phone camera image of your work.<br/><br/>";
 
 var q = document.createElement('div');
 this.qr_div = q;
 d.appendChild(q);

 var url =
     'https://' + 
     location.hostname + 
     '/sangaku/phone_upload.php' +
     '?session_id=' + this.session_id +
     '&item_id=' + this.item.id +
     '&student_id=' + this.student_id;
 
 new QRCode(q,{text : url, width : 256, height : 256});

 q.style.width = "50%";
 q.style.margin = "0 auto";

 d.appendChild(document.createElement('br'));
 if (true) {
  var a = document.createElement('a');
  a.href = url;
  a.innerHTML = 'upload page';
  d.appendChild(a);
 }
};

//////////////////////////////////////////////////////////////////////

sangaku.reviewer = {
 student_id : null,
 item : null
};

sangaku.reviewer.create_dom = function() {
 var me = this;
 var d = document.createElement('div');
 this.div = d;

 d.innerHTML = 'Any uploaded work will appear here.<br/>';
 
};
 
//////////////////////////////////////////////////////////////////////

sangaku.upload_block = {
 session_id : null,
 student_id : null,
 teacher_id : null,
 item : null,
 teacher_mode : false,
 tabs : [['Type','type_uploader'],
         ['Webcam','camera_uploader'],
         ['Phone','phone_uploader'],
         ['File','file_uploader']]
};

sangaku.upload_block.configure_child = function(child) {
 child.session_id = this.session_id;
 child.student_id = this.student_id;
 child.item    = this.item;

 if ('teacher_id' in this) {
  child.teacher_id = this.teacher_id;
 }
 
 return child;
};

sangaku.create_upload_block =
 function(session_id,student_id,item,teacher_id) {
  var u = Object.create(this.upload_block);
  u.session_id = session_id;
  u.student_id = student_id;
  u.item       = item;

  if (teacher_id) {
   u.teacher_mode = true;
   u.teacher_id = teacher_id;
  }

  if (! u.teacher_mode) {
   u.state = 'closed';
   u.button_div = document.createElement('div');
   u.button_div.className = 'upload_block_button';
   u.button_div.innerHTML = 'Show my work to the teacher';
   u.button_div.onclick = function() { u.toggle(); }
  }
  
  var d = document.createElement('div');
  u.panel_div = d;
  d.className = 'upload_block';
  d.style.display = 'none';

  var r = document.createElement('div');
  u.reviews_div = r;
  r.className = 'reviews';
  d.appendChild(r);
  
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

  u.select_tab('type_uploader');
  
  return u;
 };

sangaku.upload_block.toggle = function() {
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

sangaku.upload_block.select_tab = function(k) {
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

sangaku.upload_block.set_tab_handler = function(k) {
 var me = this;
 this[k].tab_button.onclick = function() { me.select_tab(k); };
};

