sangaku.sheet_editor = {};

sangaku.sheet_editor.init = function(id) {
 var me = this;
 
 this.intro_textarea = document.main_form.intro;
 this.intro_display_div = document.getElementById('intro_display');
 this.preview_button = document.getElementById('preview_button');
 this.preview_button.onclick = function() {
  me.intro_display_div.innerHTML = me.intro_textarea.value;
  MathJax.typeset([me.intro_display_div]);
  return 0;
 }

 this.container_element = document.main_form.container;
 this.questions_div = document.getElementById('questions_div');

 this.problem_sheet = Object.create(sangaku.problem_sheet);
 this.problem_sheet.id = id;
 this.problem_sheet.full_load();
 this.problem_sheet.container = Object.create(sangaku.question_item);
 this.problem_sheet.container.id = -1;
 this.problem_sheet.container.alt_id = -1;
 this.problem_sheet.container.problem_sheet_id = id;
 this.problem_sheet.container.position = 1;
 this.problem_sheet.container.header = '';
 this.problem_sheet.container.title = '';
 this.problem_sheet.container.level = 0;
 this.problem_sheet.container.is_bottom = 0;
 this.problem_sheet.container.problem = '';
 this.problem_sheet.container.solution = ''; 
 this.problem_sheet.container.children = this.problem_sheet.top_items;

 this.problem_sheet.deletions = [];

 this.next_id = 0;
 this.items_by_alt_id = {};
 
 this.questions_div.appendChild(this.create_item_dom(this.problem_sheet.container));

 this.next_id++;
 
 this.save_button = document.getElementById('save_td');
 this.save_button.onclick = function() {
  document.main_form.container.value =
   JSON.stringify(me.problem_sheet.container);

  document.main_form.deletions.value =
   JSON.stringify(me.problem_sheet.deletions);

  document.main_form.command.value = 'save';

  document.main_form.submit();
 }
};

sangaku.sheet_editor.create_item_dom = function(item) {
 var me = this;
 this.next_id = Math.max(this.next_id,item.id + 1);
 if (! 'alt_id' in item) {
  item.alt_id = item.id;
 }
 item.parent = null;
 this.items_by_alt_id[item.alt_id] = item;
  
 item.div = document.createElement('div');
 item.div.className = 'edit_question item_level' + item.level;

 if (item.level > 0) {
  item.headers_div = document.createElement('div');
  item.headers_div.className = 'edit_question_headers';
  item.div.appendChild(item.headers_div);
 
  item.auto_header_div = document.createElement('div');
  item.auto_header_div.className = 'edit_question_auto_header';
  item.auto_header_div.innerHTML = 'Label: ' + item.auto_header();
  item.headers_div.appendChild(item.auto_header_div);

  item.header_div = document.createElement('div');
  item.header_div.className = 'edit_question_header';
  var s = document.createElement('span');
  s.innerHTML = 'Change: ';
  item.header_div.appendChild(s);
  item.header_input = document.createElement('input');
  item.header_input.size = 5;
  item.header_input.value = item.header;
  item.header_input.onchange = function() {
   item.header = item.header_input.value;
   item.auto_header_div.innerHTML = 'Label: ' + item.auto_header();
  };
  item.header_div.appendChild(item.header_input);
  item.headers_div.appendChild(item.header_div);
 
  item.title_div = document.createElement('div');
  item.title_div.className = 'edit_question_title';
  var s = document.createElement('span');
  s.innerHTML = 'Title: ';
  item.title_div.appendChild(s);
  item.title_input = document.createElement('input');
  item.title_input.size = 45 - 5 * item.level;
  item.title_input.value = item.title;
  item.title_input.onchange = function() {
   item.title = item.title_input.value;
  };
  item.title_div.appendChild(item.title_input);
  item.headers_div.appendChild(item.title_div);

  item.delete_icon = document.createElement('img');
  item.delete_icon.className = 'edit_question_delete_icon';
  item.delete_icon.src = '/sangaku/icons/cross.png';
  item.delete_icon.alt = 'Delete ' + item.level_name().toLowerCase();
  item.delete_icon.onclick = function() { me.delete_item(item); }
  item.headers_div.appendChild(item.delete_icon);
 
  item.headers_help_toggler = document.createElement('img');
  item.headers_help_toggler.className = 'right_help_toggler';
  item.headers_help_toggler.src = '/sangaku/icons/qmark.png';
  item.headers_help_toggler.alt = 'Show or hide help';
  item.headers_help_toggler.onclick = function() {
   var d = item.headers_help_div;
   d.style.display = (d.style.display == 'none') ? 'block' : 'none';
  }
  item.headers_div.appendChild(item.headers_help_toggler);
  
  item.headers_help_div = document.createElement('div');
  item.headers_help_div.style.display = 'none';
  item.div.appendChild(item.headers_help_div);
  var eg_labels = ['','Q3','(c)','(iv)'];
  var eg_label = eg_labels[item.level];
 
  item.headers_help_div.innerHTML =
   'A label like "' + eg_label + '" is generated automatically, but ' +
   'you can override this by entering a label in the box above.  You might ' +
   'do this to maintain consistency with labels used in a problem booklet, ' +
   'for example.  You can also enter a descriptive title, but that is optional.';

  item.problem_label_div = document.createElement('div');
  item.problem_label_div.className = 'edit_question_problem_label';
  item.div.appendChild(item.problem_label_div);
  var s = document.createElement('span');
  s.innerHTML = 'Problem';
  item.problem_label_div.appendChild(s);
 
  item.problem_help_toggler = document.createElement('img');
  item.problem_help_toggler.className = 'right_help_toggler';
  item.problem_help_toggler.src = '/sangaku/icons/qmark.png';
  item.problem_help_toggler.alt = 'Show or hide help';
  item.problem_help_toggler.onclick = function() {
   var d = item.problem_help_div;
   d.style.display = (d.style.display == 'none') ? 'block' : 'none';
  }
  item.problem_label_div.appendChild(item.problem_help_toggler);
  
  item.problem_help_div = document.createElement('div');
  item.problem_help_div.style.display = 'none';
  item.div.appendChild(item.problem_help_div);
  
  item.problem_help_div.innerHTML =
   '<p>Enter the problem in the box below.  If the question has parts, then ' +
   'everything that directly requires a response should be in one of those ' +
   'parts, and the problem box here should just contain introductory ' +
   'material.</p> ' +
   '<p>You can use LaTeX for mathematics, and it will be displayed by ' +
   'MathJax.  For other kinds of layout (such as bulleted lists), you ' +
   'should use HTML markup.</p>';

  item.div.appendChild(document.createElement('br'));
  item.problem_area = document.createElement('textarea');
  item.problem_area.className = 'edit_question_problem_area';
  item.problem_area.cols = 80;
  item.problem_area.rows = 6;
  item.problem_area.value = item.problem;
  item.problem_area.onchange = function() {
   item.problem = item.problem_area.value;
   item.problem_display_div.innerHTML = item.problem_area.value;
   MathJax.typeset([item.problem_display_div]);
  };
  item.div.appendChild(item.problem_area);
  item.div.appendChild(document.createElement('br'));

  item.problem_preview_button = document.createElement('button');
  item.problem_preview_button.className = 'edit_question_preview_button';
  item.problem_preview_button.type = 'button';
  item.problem_preview_button.innerHTML = 'Preview';
  item.problem_preview_button.onclick = function() {
   item.problem = item.problem_area.value;
   item.problem_display_div.innerHTML = item.problem_area.value;
   MathJax.typeset([item.problem_display_div]);
  }
  item.div.appendChild(item.problem_preview_button);
  item.div.appendChild(document.createElement('br'));
 
  item.problem_display_div = document.createElement('div');
  item.problem_display_div.className = 'edit_question_problem_display';
  item.problem_display_div.innerHTML = item.problem;
  item.div.appendChild(item.problem_display_div);
  MathJax.typeset([item.problem_display_div]);
 
  item.solution_label_div = document.createElement('div');
  item.solution_label_div.className = 'edit_question_solution_label';
  item.div.appendChild(item.solution_label_div);
  var s = document.createElement('span');
  s.innerHTML = 'Solution';
  item.solution_label_div.appendChild(s);
 
  item.solution_help_toggler = document.createElement('img');
  item.solution_help_toggler.className = 'right_help_toggler';
  item.solution_help_toggler.src = '/sangaku/icons/qmark.png';
  item.solution_help_toggler.alt = 'Show or hide help';
  item.solution_help_toggler.onclick = function() {
   var d = item.solution_help_div;
   d.style.display = (d.style.display == 'none') ? 'block' : 'none';
  }
  item.solution_label_div.appendChild(item.solution_help_toggler);

  item.solution_help_div = document.createElement('div');
  item.solution_help_div.style.display = 'none';
  item.div.appendChild(item.solution_help_div);
 
  item.solution_help_div.innerHTML =
   '<p>You can enter a solution in the box below.  This is mainly intended ' +
   'for ease of reference for tutors, so it can be terse.  Other mechanisms ' +
   'should be used for presenting solutions to students.</p>';

  item.div.appendChild(document.createElement('br'));
  item.solution_area = document.createElement('textarea');
  item.solution_area.className = 'edit_question_solution_area';
  item.solution_area.cols = 80;
  item.solution_area.rows = 6;
  item.solution_area.value = item.solution;
  item.solution_area.onchange = function() {
   item.solution = item.solution_area.value;
   item.solution_display_div.innerHTML = item.solution_area.value;
   MathJax.typeset([item.solution_display_div]);
  };
  item.div.appendChild(item.solution_area);
  item.div.appendChild(document.createElement('br'));

  item.solution_preview_button = document.createElement('button');
  item.solution_preview_button.type = 'button';
  item.solution_preview_button.className = 'edit_question_preview_button';
  item.solution_preview_button.innerHTML = 'Preview';
  item.solution_preview_button.onclick = function() {
   item.solution = item.solution_area.value;
   item.solution_display_div.innerHTML = item.solution_area.value;
   MathJax.typeset([item.solution_display_div]);
  }
  item.div.appendChild(item.solution_preview_button);
  item.div.appendChild(document.createElement('br'));
  
  item.solution_display_div = document.createElement('div');
  item.solution_display_div.className = 'edit_question_solution_display';
  item.solution_display_div.innerHTML = item.solution;
  item.div.appendChild(item.solution_display_div);
  MathJax.typeset([item.solution_display_div]);
 }
 
 if (item.level < 3) {
  item.parts_label_div = document.createElement('div');
  item.parts_label_div.className = 'edit_question_parts_label';
  item.div.appendChild(item.parts_label_div);
  var s = document.createElement('span');
  s.innerHTML = item.next_level_name() + 's';
  s.style['font-size'] = [24,16,12][item.level] + 'px';
  item.parts_label_div.appendChild(s);
  item.add_part_icon = document.createElement('img');
  item.add_part_icon.src = '/sangaku/icons/plus.png';
  var alts = [
   'Add a new question',
   'Add a new part of this question',
   'Add a new subpart',
   ''
  ];
  item.add_part_icon.alt = alts[item.level];
  item.add_part_icon.className = 'add_part';
  item.add_part_icon.onclick = function() {
   me.add_part(item);
  }
  item.parts_label_div.appendChild(item.add_part_icon);

  item.parts_div = document.createElement('div');
  item.parts_div.className = 'edit_question_parts';
  item.div.appendChild(item.parts_div);
 
  var i = 1;
  for (var child of item.children) {
   child.position = i++;
   child.parent_alt_id = child.parent_id;
   child.parent = null;
   item.div.appendChild(this.create_item_dom(child));
  }
 }
 
 return item.div;
};

sangaku.sheet_editor.delete_item = function(item) {
 var p = this.items_by_alt_id[item.parent_id];
 p.div.removeChild(item.div);
 var old_children = p.children;
 p.children = [];
 for (var child of old_children) {
  if (child !== item) {
   p.children.push(child);
   child.position = p.children.length;
   child.auto_header_div.innerHTML = 'Label: ' + child.auto_header();
  }
 }

 if (item.id) {
  this.problem_sheet.deletions.push(item.id);
 }
};

sangaku.sheet_editor.add_part = function(item) {
 var child = Object.create(sangaku.question_item);
 child.id = null;
 child.alt_id = this.next_id++;
 child.problem_sheet_id = item.problem_sheet_id;
 child.parent_alt_id = item.alt_id;
 child.parent_id = item.id;
 child.position = item.children.length + 1;
 child.header = '';
 child.title = '';
 child.level = item.level + 1;
 child.is_bottom = 0;
 child.problem = '';
 child.solution = '';
 child.children = [];
 item.is_bottom = 0;
 item.children.push(child);
 item.div.appendChild(this.create_item_dom(child));
};
