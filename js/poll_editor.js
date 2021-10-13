sangaku.poll_editor = {};

sangaku.poll_editor.init = function(id) {
 var me = this;
 
 this.intro_textarea = document.main_form.intro;
 this.intro_display_div = document.getElementById('intro_display');
 this.intro_preview_button = document.getElementById('intro_preview_button');
 this.intro_preview_button.onclick = function() {
  me.intro_display_div.innerHTML = me.intro_textarea.value;
  MathJax.typeset([me.intro_display_div]);
  return 0;
 }

 this.solution_textarea = document.main_form.solution;
 this.solution_display_div = document.getElementById('solution_display');
 this.solution_preview_button = document.getElementById('solution_preview_button');
 this.solution_preview_button.onclick = function() {
  me.solution_display_div.innerHTML = me.solution_textarea.value;
  MathJax.typeset([me.solution_display_div]);
  return 0;
 }

 this.is_judgemental_cb = document.getElementById('is_judgemental_cb');
 this.is_judgemental_cb.onclick = function() {
  me.set_is_judgemental();
 }
 
 this.items_element = document.main_form.items;
 this.items_div = document.getElementById('items_div');

 this.poll = Object.create(sangaku.poll);
 this.poll.id = id;
 this.poll.full_load();

 for (i of this.poll.items) {
  this.items_div.appendChild(this.create_item_dom(i));
 }

 this.set_is_judgemental();
 
 this.poll.items_by_id = {};
 this.poll.deletions = [];

 this.save_button = document.getElementById('save_td');
 this.save_button.onclick = function() {
  document.main_form.items.value =
   JSON.stringify(me.poll.items);

  document.main_form.deletions.value =
   JSON.stringify(me.poll.deletions);

  document.main_form.command.value = 'save';

  document.main_form.submit();
 }

 this.add_item_button = document.getElementById('add_item_button');
 this.add_item_button.onclick = function() { me.add_item(); }
};

sangaku.poll_editor.create_item_dom = function(item) {
 var me = this;
 
 item.div = document.createElement('div');
 item.div.className = 'edit_item';

 item.headers_div = document.createElement('div');
 item.headers_div.className = 'edit_item_headers';
 item.div.appendChild(item.headers_div);
 
 item.seq_div = document.createElement('div');
 item.seq_div.className = 'edit_item_seq';
 var s = document.createElement('span');
 s.innerHTML = 'Item number: ';
 item.seq_div.appendChild(s);
 item.seq_input = document.createElement('input');
 item.seq_input.size = 5;
 item.seq_input.value = item.sequence_number;
 item.seq_input.onchange = function() {
  item.sequence_number = item.seq_input.value;
 };
 
 item.seq_div.appendChild(item.seq_input);
 item.headers_div.appendChild(item.seq_div);
 
 item.code_div = document.createElement('div');
 item.code_div.className = 'edit_item_code';
 var s = document.createElement('span');
 s.innerHTML = 'Code: ';
 item.code_div.appendChild(s);
 item.code_input = document.createElement('input');
 item.code_input.size = 10;
 item.code_input.value = item.code;
 item.code_input.onchange = function() {
  item.code = item.code_input.value;
 };
 item.code_div.appendChild(item.code_input);
 item.headers_div.appendChild(item.code_div);

 item.is_correct_div = document.createElement('div');
 item.is_correct_div.className = 'edit_item_is_correct';
 var s = document.createElement('span');
 s.innerHTML = 'Correct: ';
 item.is_correct_div.appendChild(s);
 item.is_correct_cb = document.createElement('input');
 item.is_correct_cb.type = 'checkbox';
 item.is_correct_cb.checked = item.is_correct ? 'checked' : '';
 item.is_correct_cb.onclick = function() {
  item.is_correct = item.is_correct_cb.checked ? 1 : 0;
 };
 item.is_correct_div.appendChild(item.is_correct_cb);
 item.headers_div.appendChild(item.is_correct_div);

 item.delete_icon = document.createElement('img');
 item.delete_icon.className = 'edit_item_delete_icon';
 item.delete_icon.src = '/sangaku/icons/cross.png';
 item.delete_icon.alt = 'Delete item';
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

 item.headers_help_div.innerHTML =
  'If you want to change the order of items, then you should change ' +
  'the item numbers and click save.  You can leave gaps between the ' +
  'item numbers if you want; the items will be sorted in ascending ' +
  'order of the numbers that you entered, and then renumbered ' +
  'sequentially in the obvious way. ' +
  '<br/><br/>' +
  'You can enter a brief code to identify each poll item if you want, ' +
  'or you can leave the code box blank if this would not be useful. ' +
  'Codes are not displayed to the students.';

 item.text_label_div = document.createElement('div');
 item.text_label_div.className = 'edit_item_text_label';
 item.div.appendChild(item.text_label_div);
 var s = document.createElement('span');
 s.innerHTML = 'Text';
 item.text_label_div.appendChild(s);
 
 item.text_help_toggler = document.createElement('img');
 item.text_help_toggler.className = 'right_help_toggler';
 item.text_help_toggler.src = '/sangaku/icons/qmark.png';
 item.text_help_toggler.alt = 'Show or hide help';
 item.text_help_toggler.onclick = function() {
  var d = item.text_help_div;
  d.style.display = (d.style.display == 'none') ? 'block' : 'none';
 }
 item.text_label_div.appendChild(item.text_help_toggler);
  
 item.text_help_div = document.createElement('div');
 item.text_help_div.style.display = 'none';
 item.div.appendChild(item.text_help_div);
  
 item.text_help_div.innerHTML =
  '<p>Enter the text of the poll item in the box below. </p> ' +
  '<p>You can use LaTeX for mathematics, and it will be displayed by ' +
  'MathJax.  For other kinds of layout (such as bulleted lists), you ' +
  'should use HTML markup.</p>';

 item.div.appendChild(document.createElement('br'));
 item.text_area = document.createElement('textarea');
 item.text_area.className = 'edit_item_text_area';
 item.text_area.cols = 80;
 item.text_area.rows = 6;
 item.text_area.value = item.text;
 item.text_area.onchange = function() {
  item.text = item.text_area.value;
  item.text_display_div.innerHTML = item.text_area.value;
  MathJax.typeset([item.text_display_div]);
 };
 item.div.appendChild(item.text_area);
 item.div.appendChild(document.createElement('br'));
 
 item.text_preview_button = document.createElement('button');
 item.text_preview_button.className = 'edit_item_preview_button';
 item.text_preview_button.type = 'button';
 item.text_preview_button.innerHTML = 'Preview';
 item.text_preview_button.onclick = function() {
  item.text = item.text_area.value;
  item.text_display_div.innerHTML = item.text_area.value;
  MathJax.typeset([item.text_display_div]);
 }
 item.div.appendChild(item.text_preview_button);
 item.div.appendChild(document.createElement('br'));
 
 item.text_display_div = document.createElement('div');
 item.text_display_div.className = 'edit_item_text_display';
 item.text_display_div.innerHTML = item.text;
 item.div.appendChild(item.text_display_div);
 MathJax.typeset([item.text_display_div]);
 
 return item.div;
};

sangaku.poll_editor.set_is_judgemental = function() {
 for (var item of this.poll.items) {
  item.is_correct_div.style.visibility =
   this.is_judgemental_cb.checked ?
   'visible' : 'hidden';
 }
};

sangaku.poll_editor.delete_item = function(item) {
 this.items_div.removeChild(item.div);

 if (item.id) {
  this.poll.deletions.push(item.id);
 }
};

sangaku.poll_editor.add_item = function() {
 var item = Object.create(sangaku.poll_item);
 item.poll_id = this.poll.id;

 var m = 0;
 for (var x of this.poll.items) {
  m = Math.max(m,x.sequence_number);
 }
 item.sequence_number = m + 1;
 item.code = '';
 item.text = '';
 this.poll.items.push(item);
 this.items_div.appendChild(this.create_item_dom(item));

 return item;
};
