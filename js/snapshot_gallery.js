sangaku.snapshot_gallery = {};

sangaku.snapshot_gallery.init = function(session_id) {
 var me = this;

 document.body.style.width = '100%';
 var m = document.getElementById('main_div');
// m.removeChild(m.children[0]);
 
 this.snapshots = [];
 this.snapshots_by_id = {};
 this.current_snapshot = 0;
 this.session_id = session_id;
 this.intro_span  = document.getElementById('intro');
 this.gallery_div = document.getElementById('gallery');
 this.thumbs_div  = document.getElementById('thumbs');
 this.prev_button = document.getElementById('prev');
 this.next_button = document.getElementById('next');
 this.prev_button.onclick = function() { me.step(-1); };
 this.next_button.onclick = function() { me.step( 1); };
 
 this.load_snapshots();
};

sangaku.snapshot_gallery.load_snapshots = function() {
 var me = this;
 var url = '/sangaku/ajax/get_snapshot_data.php' +
     '?session_id=' + this.session_id;
 fetch(url).then(
  response => response.json()
 ).then(
  x => me.load_snapshots_data(x)
 );

// setTimeout(function() { me.load_snapshots(); },5000 );
}; 

sangaku.snapshot_gallery.load_snapshots_data = function(ss) {
 var at_last =
     (this.snapshots.length == 0 ||
      this.current_snapshot == this.snapshots.length - 1);
 
 for (var s0 of ss) {
  if (! (s0.id in this.snapshots_by_id)) {
   var s = sangaku.snapshot.scrunch(s0);
   s.index = this.snapshots.length;
   this.snapshots.push(s);
   this.snapshots_by_id[s.id] = s;
   this.create_snapshot_dom(s);
   if (at_last) {
    this.show_snapshot(s.id);
    at_last = 0;
   }
  }
 }
};

sangaku.snapshot_gallery.create_snapshot_dom = function(s) {
 var me = this;

 me.intro_span.style.display = 'none';
 s.thumb_div = document.createElement('div');
 s.thumb_div.className = 'thumb';
 s.thumb_img = document.createElement('img');
 s.thumb_img.className = 'thumb';
 s.thumb_img.src = '/sangaku/ajax/download_snapshot.php?snapshot_id=' + s.id;
 s.thumb_img.onclick = function() { me.show_snapshot(s.id); }
 s.thumb_div.appendChild(s.thumb_img);
 this.thumbs_div.appendChild(s.thumb_div);

 s.div = document.createElement('div');
 s.div.className = 'snapshot';
 s.img = document.createElement('img');
 s.img.className = 'snapshot';
 s.img.src = '/sangaku/ajax/download_snapshot.php?snapshot_id=' + s.id;
 s.div.appendChild(s.img);
 this.gallery_div.appendChild(s.div);
};

sangaku.snapshot_gallery.show_snapshot = function(id) {
 for (s of this.snapshots) {
  if (s.id == id) {
   s.div.style.display = 'block';
   s.thumb_div.className = 'thumb_selected';
  } else {
   s.div.style.display = 'none';
   s.thumb_div.className = 'thumb';
  }
 }
};

sangaku.snapshot_gallery.step = function(d) {
 var n = this.snapshots.length;
 if (n == 0) { return null; }

 var i = (this.current_snapshot + d) % n;
 var s = this.snapshots[i];
 this.show_snapshot(s.id);
};
