
function QueryFilter(opts) {
  this.fields = [{
    label: '这里是文本',
    input: 'text',
  },{
    label: '这里是日期',
    input: 'date',
  }];
}

QueryFilter.prototype.getRoot = function() {
  let self = this;
  this.root = dom.element(`
    <div class="pl-2 mr-5"
         style="width: 100%; height: 26px; border-bottom: 1px solid rgba(0, 0, 0, 0.1); cursor: text; 
                line-height: 26px;">
      <i class="fas fa-search pr-2" style="opacity: 0.3;"></i>
      <style>#__input_dummy{outline: none}</style>
      <input id="__input_dummy" style="height: 22px; width: 6px; border: none;">
    </div>
  `);
  this.root.appendChild(this.getConditions());

  this.dummy = dom.find('input', this.root);

  dom.bind(this.root, 'click', (ev) => {
    self.dummy.focus();
  });
  dom.bind(this.dummy, 'focus', (ev) => {
    let rectRoot = self.root.getBoundingClientRect();
    let rectInput = self.dummy.getBoundingClientRect();
    self.conditions.style.left = (rectInput.left - rectRoot.left) + 'px';
    self.conditions.style.top = '25px';
    self.conditions.style.display = '';
  });
  dom.bind(this.dummy, 'blur', (ev) => {
    // self.conditions.style.display = 'none';
  });
  // not allow to input anything
  dom.bind(this.dummy, 'keyup', (ev) => {
    self.dummy.value = '';
    return false;
  });

  return this.root;
};

QueryFilter.prototype.getConditions = function() {
  let self = this;
  this.conditions = dom.element(`
    <div style="position: absolute; display: none;">
      <ul class="list-group"></ul>
    </div>
  `);
  let ul = dom.find('ul', this.conditions);
  for (let i = 0; i < this.fields.length; i++) {
    let li = dom.templatize(`
      <li class='list-group-item font-weight-bold pointer pt-0 pb-0 pl-1 pr-1'>{{label}}</li>
    `, this.fields[i]);
    dom.model(li, this.fields[i]);
    ul.appendChild(li);

    dom.bind(li, 'click', ev => {
      let li = dom.ancestor(ev.target, 'li');
      let filter = dom.model(li);
      self.addFilter(filter);
      self.conditions.style.display = 'none';
      self.dummy.blur();
      ev.stopImmediatePropagation();
    });
  }
  let li = dom.element(`
    <li class='list-group-item pointer text-success font-weight-bold pt-0 pb-0 pl-1 pr-1' style="text-align: center;">关闭</li>
  `);
  ul.appendChild(li);

  dom.bind(li, 'click', ev => {
    let li = dom.ancestor(ev.target, 'li');
    self.conditions.style.display = 'none';
    self.dummy.blur();
    ev.stopImmediatePropagation();
  });
  return this.conditions;
};

QueryFilter.prototype.addFilter = function(filter) {
  let self = this;
  let el = dom.templatize(`
    <span class="tag-removable gray font-12 m-0 mr-1" style="height: 22px; line-height: 22px;">
      <span>{{label}}: </span>
      <strong>&nbsp;</strong>
      <i class="fas fa-times"></i>
    </span>
  `, filter);
  let style = dom.find('style', this.root);
  this.root.insertBefore(el, style);

  let i = dom.find('i', el);
  dom.bind(i, 'click', ev => {
    ev.stopImmediatePropagation();
    let span = ev.target.parentElement;
    span.remove();
  });
  let strong = dom.find('strong', el);
  dom.bind(strong, 'click', ev => {
    ev.stopImmediatePropagation();
    if (filter.input === 'date') {
      self.displayDateInput(strong);
    }
  });
  dom.bind(strong, 'keydown', ev => {
    if (ev.keyCode === 13) {
      ev.preventDefault();
      // TODO: 发起查询，失去焦点
      strong.blur();
    }
  });
  dom.bind(el, 'click', ev => {
    ev.stopImmediatePropagation();
  });
  // this.displayTextInput(strong);
  if (filter.input === 'text') {
    strong.setAttribute('contenteditable', 'true');
    strong.focus();
  } else if (filter.input === 'date') {
    self.displayDateInput(strong);
  }
};

QueryFilter.prototype.displayTextInput = function(triggeredEl) {
  let el = dom.element(`
    <div class="p-2" style="position: absolute; width: 300px; 
         border: 1px solid rgba(0, 0, 0, 0.1); z-index: 9999; background: rgba(0, 0, 0, 0.1);">
      <input class="form-control">
      <div class="mt-2">
        <button class="btn btn-sm btn-primary">确定</button>
        <button class="btn btn-sm btn-success">取消</button>
      </div>
    </div>
  `);
  let rectRoot = this.root.getBoundingClientRect();
  let rectInput = triggeredEl.getBoundingClientRect();
  let input = dom.find('input', el);
  el.style.left = (rectInput.left - rectRoot.left) + 'px';
  el.style.top = '25px';
  dom.bind(el, 'click', ev => {
    ev.stopImmediatePropagation();
    el.remove();
  });
  dom.bind(input, 'click', ev => {
    ev.stopImmediatePropagation();
  });
  this.root.appendChild(el);
};

QueryFilter.prototype.displayDateInput = function(triggeredEl) {
  let el = dom.element(`
    <div class="p-2" style="position: absolute;
         border: 1px solid rgba(0, 0, 0, 0.1); background: white;">
    </div>
  `);
  let rectRoot = this.root.getBoundingClientRect();
  let rectInput = triggeredEl.getBoundingClientRect();
  let input = dom.find('input', el);
  el.style.left = (rectInput.left - rectRoot.left) + 'px';
  el.style.top = '25px';
  dom.bind(el, 'click', ev => {
    ev.stopImmediatePropagation();
    el.remove();
  });
  dom.bind(input, 'click', ev => {
    ev.stopImmediatePropagation();
  });
  $(el).datetimepicker({
    format: 'YYYY-MM-DD',
    locale: 'zh_CN',
    inline: true,
  }).on('dp.change', ev => {
    triggeredEl.innerText = moment(ev.date).format('YYYY-MM-DD');
    el.remove();
  });
  this.root.appendChild(el);
};

QueryFilter.prototype.displayDateRangeInput = function() {

};

QueryFilter.prototype.displaySelectInput = function() {

};

QueryFilter.prototype.render = function() {

};