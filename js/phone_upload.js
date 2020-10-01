sangaku.phone_upload_page = {};

sangaku.phone_upload_page.init = function() {
 var me = this;

 var u = Object.create(sangaku.camera_uploader);
 this.uploader = u;
 u.session_id = this.session_id;
 u.student_id = this.student_id;
 u.item_id = this.item_id;
 u.create_dom();
 document.body.appendChild(u.div);
 u.startup();
};

