
function QueryFilter(opts) {
  this.fields = opts.fields;
  this.table = opts.table;
  this.convert = opts.convert || function (data) {return data};
}

QueryFilter.prototype.getRoot = function() {
  let self = this;
  this.root = dom.element(`
    <div class="pl-2 mr-5"
         style="width: 100%; height: 26px; border-bottom: 1px solid rgba(0, 0, 0, 0.1); cursor: text; 
                line-height: 26px; z-index: 999;">
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

    document.querySelectorAll('.query-filter').forEach((el, idx) => {
      el.remove();
    });
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
      <li class='list-group-item font-weight-bold pointer pt-1 pb-1 pl-2 pr-2'>{{title}}</li>
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
    <li class='list-group-item pointer text-success font-weight-bold pt-1 pb-1 pl-2 pr-2' style="text-align: center;">关闭</li>
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
      <span>{{title}}: </span>
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
    // 回调表格重新请求

    self.request();
  });
  let strong = dom.find('strong', el);
  dom.bind(strong, 'click', ev => {
    // 清除已经弹出的条件框
    document.querySelectorAll('.query-filter').forEach((el, idx) => {
      el.remove();
    });
    // 隐藏条件选项
    self.conditions.style.display = 'none';
    
    ev.stopImmediatePropagation();
    if (filter.input === 'date') {
      self.displayDateInput(strong);
    } else if (filter.input === 'select' || filter.input === 'check') {
      self.displaySelectInput(strong, filter);
    }
  });
  dom.bind(strong, 'keydown', ev => {
    if (ev.keyCode === 13) {
      ev.preventDefault();
      // TODO: 发起查询，失去焦点
      strong.blur();
    }
  });
  dom.bind(strong, 'blur', ev => {
    // 回调表格重新发起请求
    self.request();
  });
  dom.bind(el, 'click', ev => {
    ev.stopImmediatePropagation();
  });
  strong.setAttribute('data-filter-name', filter.name);
  strong.setAttribute('data-filter-input', filter.input);
  if (filter.input === 'text') {
    strong.setAttribute('contenteditable', 'true');
    strong.focus();
  } else if (filter.input === 'date') {
    self.displayDateInput(strong);
  } else if (filter.input === 'select' || filter.input === 'check') {
    self.displaySelectInput(strong, filter)
  } else if (filter.input === 'bool') {
    strong.setAttribute('data-filter-values', filter.values);
    strong.innerText = '是';
    self.request();
  }
};

QueryFilter.prototype.displayDateInput = function(triggeredEl) {
  document.querySelectorAll('.query-filter').forEach((el, idx) => {
    el.remove();
  });
  let self = this;
  let el = dom.element(`
    <div class="query-filter" style="position: absolute;
         border: 1px solid rgba(0, 0, 0, 0.1); background: white;">
    </div>
  `);
  let rectRoot = this.root.getBoundingClientRect();
  let rectInput = triggeredEl.getBoundingClientRect();
  el.style.left = (rectInput.left - rectRoot.left) + 'px';
  el.style.top = '25px';
  dom.bind(el, 'click', ev => {
    // 阻止重新弹出条件选择框
    ev.stopImmediatePropagation();
  });
  $(el).datetimepicker({
    format: 'YYYY-MM-DD',
    locale: 'zh_CN',
    useCurrent: false,
    inline: true,
  }).on('dp.change', ev => {
    // 显示日期
    triggeredEl.innerText = moment(ev.date).format('YYYY-MM-DD');
    // 去掉日期选择框
    el.remove();
    // 回调表格重新请求
    self.request();
  });
  this.root.appendChild(el);
};

QueryFilter.prototype.displayDateRangeInput = function() {

};

QueryFilter.prototype.displaySelectInput = function(triggeredEl, filter) {
  document.querySelectorAll('.query-filter').forEach((el, idx) => {
    el.remove();
  });
  let self = this;
  let el = dom.element(`
    <div class="query-filter" style="position: absolute; min-width: 160px;">
      <ul class="list-group"></ul>
    </div>
  `);

  dom.bind(el, 'click', ev => {
    ev.stopImmediatePropagation();
  });

  let rectRoot = this.root.getBoundingClientRect();
  let rectInput = triggeredEl.getBoundingClientRect();
  el.style.left = (rectInput.left - rectRoot.left) + 'px';
  el.style.top = '25px';

  let ul = dom.find('ul', el);
  // string to json
  if (typeof filter.values === 'string') {
    filter.values = JSON.parse(filter.values);
  }
  for (let i = 0; i < filter.values.length; i++) {
    let val = filter.values[i];
    let li = dom.templatize(`
      <li class='list-group-item font-weight-bold pointer p-1 pl-4'>
        <input name="values" class="form-check-input checkbox is-outline mr-2" type="checkbox" value="{{value}}">
        <span style="position: relative; top: 2px;">{{text}}</span>
      </li>
    `, val);
    ul.appendChild(li);
  }
  let li = dom.element(`
    <li class='list-group-item font-weight-bold pointer p-1 pl-4' style="line-height: 33px;">
      <div class="d-flex">
        <a class="text-primary font-weight-bold" style="width: 50%; text-align: center;">确认</a>
        <a class="text-warning font-weight-bold" style="width: 50%; text-align: center;">取消</a>
      </div>
    </li>
  `);
  ul.appendChild(li);
  // 确认
  dom.bind(li.children[0].children[0], 'click', ev => {
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    el.remove();
    let values = dom.formdata(ul).values;
    let texts = [];
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < filter.values.length; j++) {
        if (filter.values[j].value === values[i]) {
          texts.push(filter.values[j].text);
          break;
        }
      }
    }
    triggeredEl.setAttribute('data-filter-values', values);
    triggeredEl.innerText = texts.join('，');
    // 回调表格重新请求
    self.request();
  });
  // 取消
  dom.bind(li.children[0].children[1], 'click', ev => {
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    el.remove();
  });
  this.root.appendChild(el);
};

QueryFilter.prototype.getValues = function() {
  let ret = {};
  this.root.querySelectorAll('strong').forEach((el, idx) => {
    let filterName = el.getAttribute('data-filter-name');
    let filterInput = el.getAttribute('data-filter-input');
    let filterValues = el.getAttribute('data-filter-values');
    if (filterInput === 'bool') {
      if (!ret['_and_condition']) ret['_and_condition'] = '';
      ret['_and_condition'] += ' ' + filterValues;
      return;
    }
    if (filterName && filterName !== '') {
      if (filterValues == null || filterValues === '') {
        ret[filterName] = el.innerText.trim();
      } else {
        ret[filterName] = filterValues.split(",")
      }
    }
  });
  return ret;
};

QueryFilter.prototype.request = function() {
  if (this.table) {
    this.table.go(1, this.convert(this.getValues()));
  }
};