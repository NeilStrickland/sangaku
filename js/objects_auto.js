var sangaku = Object.create(frog);
sangaku.object = Object.create(frog.object);
sangaku.module = Object.create(sangaku.object);
sangaku.module.object_type = 'module';
sangaku.module.key = 'id';
sangaku.module.fields = {"id":{"type":"integer","notnull":"true"},"somas_moid":{"type":"integer"},"code":{"type":"text"},"title":{"type":"text"},"is_regular":{"type":"boolean","default":1},"semester":{"type":"text"},"video_url":{"type":"text"},"video_url_description":{"type":"text"}};
sangaku.problem_sheet = Object.create(sangaku.object);
sangaku.problem_sheet.object_type = 'problem_sheet';
sangaku.problem_sheet.key = 'id';
sangaku.problem_sheet.fields = {"id":{"type":"integer","notnull":"true"},"module_id":{"type":"integer","link":"module"},"semester":{"type":"integer"},"week_number":{"type":"integer"},"code":{"type":"text"},"title":{"type":"text"},"intro":{"type":"text"},"latex_source":{"type":"text"}};
sangaku.question_item = Object.create(sangaku.object);
sangaku.question_item.object_type = 'question_item';
sangaku.question_item.key = 'id';
sangaku.question_item.fields = {"id":{"type":"integer","notnull":"true"},"problem_sheet_id":{"type":"integer","link":"problem_sheet"},"parent_id":{"type":"integer","link":"question_item"},"position":{"type":"integer"},"header":{"type":"text"},"title":{"type":"text"},"level":{"type":"integer"},"is_bottom":{"type":"boolean"},"problem":{"type":"text","default":""},"solution":{"type":"text","default":""}};
sangaku.registration = Object.create(sangaku.object);
sangaku.registration.object_type = 'registration';
sangaku.registration.key = 'id';
sangaku.registration.fields = {"id":{"type":"integer","notnull":"true"},"student_id":{"type":"integer","link":"user"},"module_id":{"type":"integer","link":"module"}};
sangaku.session = Object.create(sangaku.object);
sangaku.session.object_type = 'session';
sangaku.session.key = 'id';
sangaku.session.fields = {"id":{"type":"integer","notnull":"true"},"problem_sheet_id":{"type":"integer","link":"problem_sheet"},"tutorial_group_id":{"type":"integer","link":"tutorial_group"},"date":{"type":"date"},"time":{"type":"time"},"duration":{"type":"integer","default":50,"notnull":true},"is_confirmed":{"type":"boolean","default":0,"notnull":true},"solutions_shown":{"type":"text"},"video_url":{"type":"text"},"is_online":{"type":"boolean"}};
sangaku.snapshot = Object.create(sangaku.object);
sangaku.snapshot.object_type = 'snapshot';
sangaku.snapshot.key = 'id';
sangaku.snapshot.fields = {"id":{"type":"integer","notnull":"true"},"session_id":{"type":"integer","link":"session"},"file_extension":{"type":"text"},"mime_type":{"type":"text"},"timestamp":{"type":"string"}};
sangaku.status = Object.create(sangaku.object);
sangaku.status.object_type = 'status';
sangaku.status.key = 'id';
sangaku.status.fields = {"id":{"type":"integer","notnull":"true"},"code":{"type":"text"},"icon":{"type":"text"},"text":{"type":"text"},"tutor_text":{"type":"text"},"message":{"type":"text"},"action":{"type":"text"}};
sangaku.status_report = Object.create(sangaku.object);
sangaku.status_report.object_type = 'status_report';
sangaku.status_report.key = 'id';
sangaku.status_report.fields = {"id":{"type":"integer","notnull":"true"},"session_id":{"type":"integer","link":"session"},"item_id":{"type":"integer","link":"question_item"},"student_id":{"type":"integer","link":"user"},"status_id":{"type":"integer","link":"status"},"timestamp":{"type":"string"}};
sangaku.tutorial_group = Object.create(sangaku.object);
sangaku.tutorial_group.object_type = 'tutorial_group';
sangaku.tutorial_group.key = 'id';
sangaku.tutorial_group.fields = {"id":{"type":"integer","notnull":"true"},"somas_id":{"type":"integer"},"module_id":{"type":"integer","link":"module"},"name":{"type":"text"},"is_lecture":{"type":"boolean","default":0},"is_online":{"type":"boolean","default":1},"is_regular":{"type":"boolean","default":1},"semester":{"type":"text"},"day_number":{"type":"integer"},"hour":{"type":"integer"},"week_parity":{"type":"text"},"room_code":{"type":"text"}};
sangaku.tutorial_group_student = Object.create(sangaku.object);
sangaku.tutorial_group_student.object_type = 'tutorial_group_student';
sangaku.tutorial_group_student.key = 'id';
sangaku.tutorial_group_student.fields = {"id":{"type":"integer","notnull":"true"},"tutorial_group_id":{"type":"integer","link":"tutorial_group"},"student_id":{"type":"integer","link":"user"}};
sangaku.tutorial_group_teacher = Object.create(sangaku.object);
sangaku.tutorial_group_teacher.object_type = 'tutorial_group_teacher';
sangaku.tutorial_group_teacher.key = 'id';
sangaku.tutorial_group_teacher.fields = {"id":{"type":"integer","notnull":"true"},"tutorial_group_id":{"type":"integer","link":"tutorial_group"},"teacher_id":{"type":"integer","link":"user"}};
sangaku.upload = Object.create(sangaku.object);
sangaku.upload.object_type = 'upload';
sangaku.upload.key = 'id';
sangaku.upload.fields = {"id":{"type":"integer","notnull":"true"},"session_id":{"type":"integer","link":"session"},"item_id":{"type":"integer","link":"question_item"},"student_id":{"type":"integer","link":"user"},"teacher_id":{"type":"integer","link":"user"},"source":{"type":"text"},"file_extension":{"type":"text"},"mime_type":{"type":"text"},"is_response":{"type":"boolean"},"timestamp":{"type":"string"}};
sangaku.user = Object.create(sangaku.object);
sangaku.user.object_type = 'user';
sangaku.user.key = 'id';
sangaku.user.fields = {"id":{"type":"integer","notnull":"true"},"somas_student_id":{"type":"integer"},"somas_person_id":{"type":"integer"},"username":{"type":"text"},"gmail_name":{"type":"text"},"email_address":{"type":"text"},"surname":{"type":"text"},"forename":{"type":"text"},"status":{"type":"text","default":"student"},"is_admin":{"type":"boolean","default":0},"password_hash":{"type":"text"}};
sangaku.poll = Object.create(sangaku.object);
sangaku.poll.object_type = 'poll';
sangaku.poll.key = 'id';
sangaku.poll.fields = {"id":{"type":"integer","notnull":"true"},"module_id":{"type":"integer","link":"module"},"problem_sheet_id":{"type":"integer","link":"problem_sheet"},"session_id":{"type":"integer","link":"session"},"code":{"type":"text"},"title":{"type":"text"},"intro":{"type":"text"},"is_judgemental":{"type":"boolean","default":0},"is_multiple":{"type":"boolean","default":0}};
sangaku.poll_instance = Object.create(sangaku.object);
sangaku.poll_instance.object_type = 'poll_instance';
sangaku.poll_instance.key = 'id';
sangaku.poll_instance.fields = {"id":{"type":"integer","notnull":"true"},"poll_id":{"type":"integer","link":"poll"},"session_id":{"type":"integer","link":"session"},"state":{"type":"text"},"start_timestamp":{"type":"integer"},"end_timestamp":{"type":"integer"}};
sangaku.poll_item = Object.create(sangaku.object);
sangaku.poll_item.object_type = 'poll_item';
sangaku.poll_item.key = 'id';
sangaku.poll_item.fields = {"id":{"type":"integer","notnull":"true"},"poll_id":{"type":"integer","link":"poll"},"sequence_number":{"type":"integer"},"code":{"type":"text"},"text":{"type":"text"},"is_correct":{"type":"boolean"}};
sangaku.poll_response = Object.create(sangaku.object);
sangaku.poll_response.object_type = 'poll_response';
sangaku.poll_response.key = 'id';
sangaku.poll_response.fields = {"id":{"type":"integer","notnull":"true"},"instance_id":{"type":"integer","link":"poll_instance"},"user_id":{"type":"integer","link":"user"},"response_text":{"type":"text"},"response_timestamp":{"type":"integer"}};
sangaku.statuses=[
    {"id":0,
     "code":"not_started",
     "icon":" ",
     "text":"I have not looked at this yet",
     "tutor_text":"Not started",
     "message":"",
     "action":""},
    {"id":1,"code":"current",
     "icon":"\u2699\ufe0f",
     "text":"I am working on this",
     "tutor_text":"Working on it",
     "message":"",
     "action":""},
    {"id":2,
     "code":"finished",
     "icon":"\u2705",
     "text":"I have finished and am happy with my answer",
     "tutor_text":"Finished",
     "message":"",
     "action":"step"},
    {"id":3,
     "code":"to_check",
     "icon":"\u2753",
     "text":"I have finished and want to check my answer",
     "tutor_text":"Finished, wants check",
     "message":"The teacher will see that you have asked for a check, and will talk to you when they can.",
     "action":"step"},
    {"id":4,
     "code":"stuck",
     "icon":"\u274c",
     "text":"I am stuck and would like some help",
     "tutor_text":"Wants help",
     "message":"The teacher will see that you have asked for help, and will talk to you when they can.",
     "action":""},
    {"id":5,
     "code":"move",
     "icon":"\u2b55",
     "text":"I am stuck and just want to move on",
     "tutor_text":"Got stuck and skipped",
     "message":"",
     "action":"step"},
    {"id":6,
     "code":"defer",
     "icon":"\u23e9",
     "text":"I want to skip this and try the next question",
     "tutor_text":"Skipped",
     "message":"",
     "action":"step"},
    {"id":7,
     "code":"responded",
     "icon":"\u27b0",
     "text":"Please read the teacher's response, then choose another status",
     "tutor_text":"Response entered",
     "message":null,
     "action":null}
].map(function(x) {
return Object.assign(Object.create(sangaku.status),x);
});
