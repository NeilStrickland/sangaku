sangaku.shower = {
 width : 600,
 height : 0,
 tabs : ['Type','Webcam','Phone','File','Review']
};

sangaku.create_shower = function(item) {
 var x = Object.create(this.shower);

 x.parent = this;
 x.session_id = this.session_id;
 x.student_id = this.student_id;
 x.secret = this.secret;
 x.item_id = item.id;

 x.state = 'closed';
 x.button_div = document.createElement('div');
 x.button_div.className = 'shower_button';
 x.button_div.innerHTML = 'Show my work to the teacher';
 item.control_div.appendChild(x.button_div);
 x.button_div.onclick = function() { x.toggle(); };
 
 var d = document.createElement('div');
 x.panel_div = d;
 d.className = 'shower_panel';
 d.style.display = 'none';
 item.div.appendChild(d);

 var td = document.createElement('div');
 td.className = 'tab';
 d.appendChild(td);

 for (i in x.tabs) {
  var T = x.tabs[i];
  var t = T.toLowerCase();
  var k = t + '_button';
  x[k] = document.createElement('button');
  x[k].className = 'tablinks';
  x[k].innerHTML = T;
  td.appendChild(x[k]);
 }
 
 for (i in x.tabs) {
  var T = x.tabs[i];
  var t = T.toLowerCase();
  var l = t + '_div';
  x[l] = document.createElement('div');
  x[l].className = 'tabcontent';
  d.appendChild(x[l]);

  x.set_tab_handler(t);
 }

 x.setup_type_div();
 x.setup_webcam_div();
 x.setup_phone_div();
 x.setup_file_div();
 x.setup_review_div();

 x.select_tab('type');
 
 return(x);
};

sangaku.shower.setup_type_div = function() {
 var me = this;
 var d = this.type_div;

 d.innerHTML =
  "You can use this tab to type in your working (or use one of the other " +
  "tabs to upload a picture or a file instead).  If you know LaTeX, " +
  "you can click the Σ button to enter mathematical expressions.<br/>";

 var a = document.createElement('textarea');
 d.appendChild(a);
 var mjl =
     "https://cdnjs.cloudflare.com/" +
     "ajax/libs/mathjax/2.7.5/MathJax.js" +
     "?config=TeX-AMS_HTML";
 
 this.type_editor = CKEDITOR.replace(a,{mathJaxLib : mjl});

 var b = document.createElement('button');
 b.style.display = 'inline-block';
 this.type_div.appendChild(b);
 b.innerHTML = 'Upload';
 this.type_upload_button = b;
 b.onclick = function() { me.type_upload(); };
};

sangaku.shower.type_upload = function() {
 var me = this;
 
 var data = new FormData();
 data.append('student_id',this.student_id);
 data.append('item_id',this.item_id);
 data.append('source','type');
 var content = this.type_editor.getData();
 data.append('content',content);
 
 var xhr = frog.create_xhr();
 xhr.open('POST','/sangaku/ajax/upload.php');
 var b = this.type_upload_button;
 b.innerHTML = 'Uploading...';
 xhr.onload = function() {
  b.innerHTML = 'Upload';
  var d = document.createElement('div');
  d.className = 'review';
  me.review_div.appendChild(d);
  d.innerHTML = content;
  MathJax.typeset([d]);
 };
 
 xhr.send(data);
};

sangaku.shower.setup_webcam_div = function() {
 var me = this;
 
 var cd = document.createElement('div');
 cd.className = 'camera';
 this.webcam_div.appendChild(cd);
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

 var b = document.createElement('button');
 b.style.display = 'inline-block';
 this.webcam_div.appendChild(b);
 b.innerHTML = 'Take picture';
 this.camera_button = b;
 b.onclick = function() { me.take_picture(); };
 
 var b = document.createElement('button');
 b.style.display = 'inline-block';
 this.webcam_div.appendChild(b);
 b.innerHTML = 'Discard';
 b.style.display = 'none';
 this.camera_discard_button = b;
 b.onclick = function() { me.camera_discard(); };
 
 var b = document.createElement('button');
 b.style.display = 'inline-block';
 this.webcam_div.appendChild(b);
 b.innerHTML = 'Upload';
 b.style.display = 'none';
 this.camera_upload_button = b;
 b.onclick = function() { me.camera_upload(); };
 
 var b = document.createElement('button');
 b.style.display = 'inline-block';
 this.webcam_div.appendChild(b);
 b.innerHTML = 'New picture';
 b.style.display = 'none';
 this.camera_new_picture_button = b;
 b.onclick = function() { me.camera_new_picture(); };

 this.webcam_state = 'unstarted';
 this.streaming = false;
};

sangaku.shower.camera_upload = function() {
 var me = this;
 var data = new FormData();
 data.append('student_id',this.student_id);
 data.append('item_id',this.item_id);
 data.append('source','webcam');
 var content = this.canvas.toDataURL('image/png');
 data.append('content',content);

 var xhr = frog.create_xhr();
 xhr.open('POST','/sangaku/ajax/upload.php');
 var b = this.camera_upload_button;
 b.innerHTML = 'Uploading...';
 xhr.onload = function() {
  // Also add to Review panel
  b.innerHTML = 'Upload';

  var d = document.createElement('div');
  d.className = 'review';
  me.review_div.appendChild(d);
  var i = document.createElement('img');
  d.appendChild(i);
  i.style.width = '100%';
  i.src = content;
  
  me.camera_button.style.display = 'none';
  me.camera_upload_button.style.display = 'none';
  me.camera_discard_button.style.display = 'none';
  me.camera_new_picture_button.style.display = 'inline-block';
 };
 xhr.send(data); 
}

sangaku.shower.setup_phone_div = function() {
 var d = this.phone_div;

 d.innerHTML =
  "Scan the QR code with your phone to be taken to a page where " +
  "you can upload a phone camera image of your work.<br/><br/>";
 
 var q = document.createElement('div');
 d.appendChild(q);

 var url =
     'https://' + 
     location.hostname + 
     '/sangaku/phone_upload.php?s=' +
     this.secret +
     '&i=' +
     this.item_id;
 
 new QRCode(q,{text : url, width : 256, height : 256});

 q.style.width = "50%";
 q.style.margin = "0 auto";

 d.appendChild(document.createElement('br'));
 var a = document.createElement('a');
 a.href = url;
 a.innerHTML = 'upload page';
 d.appendChild(a);
};

sangaku.shower.setup_file_div = function() {
 var d = this.file_div;
 var me = this;
    
 d.appendChild(
  this.file_input = document.createElement('input')
 );

 this.file_input.setAttribute('type','file');
 this.file_upload_button = document.createElement('button');
 this.file_upload_button.innerHTML = 'Upload';
 this.file_upload_button.onclick = function() {
  me.file_upload();
 };

 d.appendChild(this.file_upload_button);
};

sangaku.shower.file_upload = function() {
 var me = this;
 var data = new FormData();
 data.append('student_id',this.student_id);
 data.append('item_id',this.item_id);
 data.append('source','file');
 data.append('upload_file',this.file_input.files[0]);

 var xhr = frog.create_xhr();
 xhr.open('POST','/sangaku/ajax/upload.php');
 var b = this.file_upload_button;
 b.innerHTML = 'Uploading...';
 xhr.onload = function() {
  // Also add to Review panel
  b.innerHTML = 'Upload';
 };
 xhr.send(data); 

}

sangaku.shower.setup_review_div = function() {

};

sangaku.shower.set_tab_handler = function(t) {
 var me = this;
 this[t + '_button'].onclick = function() { me.select_tab(t); }
};

sangaku.shower.select_tab = function(t) {
 for (var i in this.tabs) {
  var u = this.tabs[i].toLowerCase();
  var k = u + '_button';
  var l = u + '_div';
  if (u == t) {
   this[k].className = 'tablinks active';
   this[l].style.display = 'block';
  } else {
   this[k].className = 'tablinks';
   this[l].style.display = 'none';   
  }
 }

 if (t == 'webcam' && this.webcam_state == 'unstarted') {
  this.webcam_init();
 }
};

sangaku.shower.toggle = function() {
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

sangaku.shower.webcam_init = function() {
 var me = this;

 this.webcam_state = 'waiting';
 
 navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(function(stream) {
   me.video.srcObject = stream;
   me.video.play();
  })
  .catch(function(err) {
   console.log("An error occurred: " + err);
  });

 this.video.addEventListener('canplay', function(ev){
  if (! me.streaming) {
   me.height = this.videoHeight / (this.videoWidth/me.width);
   
   this.setAttribute('width', me.width);
   this.setAttribute('height', me.height);
   me.canvas.setAttribute('width', me.width);
   me.canvas.setAttribute('height', me.height);
   me.streaming = true;
   me.webcam_state = 'streaming';
  }
 }, false);

 this.camera_button.addEventListener('click',
   function(ev) {
    me.take_picture();
   }
 );
};

sangaku.shower.clear_img = function() {
 var context = this.canvas.getContext('2d');
 context.fillStyle = '#FFFFFF';
 context.fillRect(0,0,this.canvas.width,this.canvas.height);
 var data = this.canvas.toDataURL('image/png');
 this.img.setAttribute('src',data);
};

sangaku.shower.take_picture = function() {
 var context = this.canvas.getContext('2d');
 if (this.width && this.height) {
  this.canvas.width = this.width;
  this.canvas.height = this.height;
  context.drawImage(this.video,0,0,this.width,this.height);
  var data = this.canvas.toDataURL('image/png');
  this.img.setAttribute('src',data);
  this.video.style.display = 'none';
  this.img.style.display = 'block';
  this.webcam_state = 'review';
  this.camera_button.style.display = 'none';
  this.camera_discard_button.style.display = 'inline-block';
  this.camera_upload_button.style.display = 'inline-block';
  this.camera_new_picture_button.style.display = 'none';
 } else {
  this.clear_img();
 }
};

sangaku.shower.camera_discard = function() {
 this.clear_img();
 this.webcam_state = 'streaming';
 this.camera_button.style.display = 'inline-block';
 this.camera_discard_button.style.display = 'none';
 this.camera_upload_button.style.display = 'none';
 this.camera_new_picture_button.style.display = 'none';
 this.video.style.display = 'block';
 this.img.style.display = 'none';
};

sangaku.shower.camera_new_picture = function() {
 this.clear_img();
 this.webcam_state = 'streaming';
 this.camera_button.style.display = 'inline-block';
 this.camera_discard_button.style.display = 'none';
 this.camera_upload_button.style.display = 'none';
 this.camera_new_picture_button.style.display = 'none';
};





sangaku.question_item.get_header = function() {
 var x = document.evaluate('.//' + this.header_tag, this.div, null,
			   XPathResult.FIRST_ORDERED_NODE_TYPE, null );
 if (x) {
  x = x.singleNodeValue.innerHTML;
  this.titled_header = x;

  var i = x.indexOf(':');
  if (i >= 0) {
   this.header = x.substring(0,i);
  } else {
   this.header = x;
  }

  if (this.parent) {
   this.full_header = this.parent.full_header + this.header;
  } else {
   this.full_header = this.header;
  }
 }

 return (x);
};

