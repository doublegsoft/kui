function StructuredDataEntry(opts) {
  if (opts && opts.container) {
    this.container = dom.find(opts.container);
  }
  this.onInput = opts.onInput;

  dom.bind(this.container, 'click', ev => {
    this.container.querySelectorAll('[sde-select]').forEach(el => {
      el.remove();
    })
  })
}

StructuredDataEntry.prototype.initialize = function(data) {
  data = data || {};
  let self = this;
  let children = this.container.querySelectorAll('[data-sde-name]');
  children.forEach(function(el, idx) {
    dom.bind(el, 'keypress', function(ev) {
      let charCode = (ev.which) ? ev.which : ev.keyCode;
      if (charCode == 13) {
        ev.preventDefault();
      }
    });
    let input = el.getAttribute('data-sde-input');
    if (input === 'number') {
      el.setAttribute('contenteditable', true);
      self.bindNumberInput(el);
    } else if (input === 'select') {
      el.classList.add('pointer');
      self.bindSelectInput(el);
    } else if (input === 'date') {

    } else if (input === 'year') {
      el.classList.add('pointer');
      self.bindYearInput(el);
    } else if (input === 'month') {
      el.classList.add('pointer');
      self.bindMonthInput(el);
    } else if (input === 'day') {
      el.classList.add('pointer');
      self.bindDayInput(el);
    } else if (input === 'multiselect') {
      el.classList.add('pointer');
      self.bindMultiselectInput(el);
    } else {
      el.setAttribute('contenteditable', true);
      self.bindTextInput(el);
    }
    if (data[el.getAttribute('data-sde-name')]) {
      let _value=data[el.getAttribute('data-sde-name')];
      let selectvalue=el.getAttribute('data-sde-values');
      let trigger = el;
      let par = trigger.parentElement.parentElement;
      el.classList.remove('sde-input-default');
      el.innerText = '【' + data[el.getAttribute('data-sde-name')] + '】';
      // 非显示的引用值
      if (el.getAttribute('data-sde-param') != '') {
        el.setAttribute('data-sde-value', data[el.getAttribute('data-sde-param')]);
      }
      // if(input=='number'&&data[el.getAttribute('data-sde-name')]!=0
      //   || input=='select'&&selectvalue.indexOf(_value)>-1
      //   || input=='multiselect' && _value.length>0
      //   || input=='text'&&data[el.getAttribute('data-sde-name')]!=el.getAttribute('data-sde-label') ){
      //   el.classList.remove('sde-input-default');
      //   el.innerText = data[el.getAttribute('data-sde-name')];
      //   par.dataset.nodata='false';
      // }
      if (par.children.forEach) {
        par.children.forEach(function (el, idx) {
          let visible = el.getAttribute('data-sde-visible');
          if (visible) {
            let strs = visible.split('==');
            if (trigger.getAttribute('data-sde-name') == strs[0] && trigger.innerText == strs[1]) {
              el.style.display = '';
            } else {
              el.style.display = 'none';
            }
          }
        });
      }
    }
  });
};

StructuredDataEntry.prototype.getValues = function() {
  let ret = {};
  let spans = this.container.querySelectorAll('span[data-sde-name]');
  for (let i = 0; i < spans.length; i++) {
    let span = spans[i];
    let name = span.getAttribute('data-sde-name');
    let label = span.getAttribute('data-sde-label');
    let type=span.getAttribute('data-sde-input');
    if (span.innerText !== label){
      ret[name] = span.innerText;
      if((type=='number'||type=='text')&&span.innerText!=0){
        var par = span.parentElement.parentElement;
        par.dataset.nodata='false';
      }
    }
  }
  return ret;
};

StructuredDataEntry.prototype.getHtml = function() {
  let html = this.container.innerHTML;
  let root = dom.element('<div>' + html + '</div>');
  let spans = root.querySelectorAll('span[data-sde-name]');
  for (let i = 0; i < spans.length; i++) {
    let span = spans[i];
    let name = span.getAttribute('data-sde-name');
    let label = span.getAttribute('data-sde-label');
    if (name.indexOf('上升指标') != -1 || name.indexOf('下降指标') != -1) {
      if (label === span.innerText.trim()) {
        span.parentElement.remove();
      }
    }
  }
  html = root.innerHTML;
  html = html.replaceAll('contenteditable', '');
  html = html.replaceAll('pointer', '');
  html = html.replaceAll('<p>', '<p style="margin-bottom: 0;">');
  return html;
};

StructuredDataEntry.prototype.getHasDataHtml = function() {
  let html = this.container.innerHTML;
  let root = dom.element('<div>' + html + '</div>');
  let pitem = root.querySelectorAll('p'),_html=null;
  for (let i = 0; i < pitem.length; i++) {
    let p = pitem[i];
    let nodata = p.getAttribute('data-nodata');
    if (nodata=='true') {
      p.remove();
    }else {
      let spans = p.querySelectorAll('span[data-sde-name]');
      for (let i = 0; i < spans.length; i++) {
        let span = spans[i];
        let name = span.getAttribute('data-sde-name');
        let label = span.getAttribute('data-sde-label');
        let type = span.getAttribute('data-sde-input');
        let values = span.getAttribute('data-sde-values');
        let val=span.innerText.trim();
        if (label ===val  || (type=='select'&&values.indexOf(val)==-1)) {
          span.parentElement.remove();
        }
      }
    }
  }
  _html = root.innerHTML;
  _html = _html.replaceAll('contenteditable', '');
  _html = _html.replaceAll('pointer', '');
  _html = _html.replaceAll('<p>', '<p style="margin-bottom: 0;">');
  _html = _html.replaceAll('<p data-nodata="false">', '<p style="margin-bottom: 0;">');
  return _html;
};

StructuredDataEntry.prototype.bindTextInput = function(el) {
  dom.bind(el, 'input', ev => {
    let el = ev.currentTarget;
    let name = el.getAttribute('data-sde-name');
    let value = el.innerText;
    this.onInput(name, value);
  });
};

StructuredDataEntry.prototype.bindNumberInput = function(el) {
  dom.bind(el, 'keypress', function(ev) {
    let charCode = (ev.which) ? ev.which : ev.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      ev.preventDefault();
    }
  });
  dom.bind(el, 'focus', function(ev) {
    document.execCommand('selectAll',false,null)
  });
  dom.bind(el, 'blur', function(ev) {
    let value=el.innerText;
    var par = el.parentElement.parentElement;
    if(el.getAttribute('data-sde-input')=='number' && value!=0 ){
      el.classList.remove('sde-input-default');
      par.dataset.nodata='false';
    }else if(el.getAttribute('data-sde-input')=='text' && value!=el.getAttribute('data-sde-label')){
      el.classList.remove('sde-input-default');
      par.dataset.nodata='false';
    }else{
      el.classList.remove('sde-input-default');
      el.classList.add('sde-input-default');
      par.dataset.nodata='true';
    }
  });
  dom.bind(el, 'input', ev => {
    let el = ev.currentTarget;
    let name = el.getAttribute('data-sde-name');
    let value = el.innerText;
    this.onInput(name, value);
  });
};

StructuredDataEntry.prototype.bindSelectInput = function(el) {
  let self = this;
  dom.bind(el, 'click', async function(ev) {
    ev.stopPropagation();

    let div = dom.find('[sde-select]');
    if (div != null) div.remove();

    let values = this.getAttribute('data-sde-values');
    let url = this.getAttribute('data-sde-url');
    // 用于显示的字段
    let field = this.getAttribute('data-sde-field');

    let vals = [];
    if (values) {
      values = values.substring(1, values.length - 1);
      vals = values.split(',');
    } else if (url) {
      let data = await xhr.promise({
        url: url,
        params: {},
      });
      vals = data;
    }

    div = self.createPopupSelect(this, vals);
    self.container.appendChild(div);
    self.positionPopup(el, div);
    let rightbar = dom.find('.right-bar')
    if (rightbar != null) {
      let rect = rightbar.getBoundingClientRect();
      if (rect.right < rectDiv.right) {
        div.style.right = '0px';
        div.style.left = 'auto';
      }
    }
  });
};

StructuredDataEntry.prototype.bindYearInput = function(el) {
  let self = this;
  dom.bind(el, 'click', async function(ev) {
    ev.stopPropagation();

    let div = dom.find('[sde-select]');
    if (div != null) div.remove();

    const currYear = new Date().getFullYear();
    const prevYear = currYear - 1;
    const nextYear = currYear + 1;

    let vals = [prevYear, currYear, nextYear];

    let rectThis = this.getBoundingClientRect();
    let rectParent = this.parentElement.getBoundingClientRect();

    div = self.createPopupSelect(this, vals);
    this.parentElement.appendChild(div);
    self.positionPopup(el, div);
    let rightbar = dom.find('.right-bar')
    if (rightbar != null) {
      let rect = rightbar.getBoundingClientRect();
      if (rect.right < rectDiv.right) {
        div.style.right = '0px';
        div.style.left = 'auto';
      }
    }
  });
};

StructuredDataEntry.prototype.bindMonthInput = function(el) {
  let self = this;
  dom.bind(el, 'click', async function(ev) {
    ev.stopPropagation();

    let div = dom.find('[sde-select]');
    if (div != null) div.remove();

    let vals = [1,2,3,4,5,6,7,8,9,10,11,12];

    let rectThis = this.getBoundingClientRect();
    let rectParent = this.parentElement.getBoundingClientRect();

    div = self.createPopupSelect(this, vals, '36px');
    this.parentElement.appendChild(div);
    const pos = self.positionPopup(ev);
    self.positionPopup(el, div);
    let rightbar = dom.find('.right-bar')
    if (rightbar != null) {
      let rect = rightbar.getBoundingClientRect();
      if (rect.right < rectDiv.right) {
        div.style.right = '0px';
        div.style.left = 'auto';
      }
    }
  });
};

StructuredDataEntry.prototype.bindDayInput = function(el) {
  let self = this;
  dom.bind(el, 'click', async function(ev) {
    ev.stopPropagation();

    let div = dom.find('[sde-select]');
    if (div != null) div.remove();

    let vals = [];
    for (let i = 1; i <= 31; i++)
      vals.push(i);

    let rectThis = this.getBoundingClientRect();
    let rectParent = this.parentElement.getBoundingClientRect();

    div = self.createPopupSelect(this, vals, '36px');
    this.parentElement.appendChild(div);
    self.positionPopup(el, div);
    let rightbar = dom.find('.right-bar')
    if (rightbar != null) {
      let rect = rightbar.getBoundingClientRect();
      if (rect.right < rectDiv.right) {
        div.style.right = '0px';
        div.style.left = 'auto';
      }
    }
  });
};

StructuredDataEntry.prototype.bindMultiselectInput = function(el) {
  let self = this;
  dom.bind(el, 'click', function(ev) {
    ev.stopPropagation();

    let div = dom.find('[sde-select]');
    if (div != null) div.remove();

    let label = this.getAttribute('data-sde-label');
    let values = this.getAttribute('data-sde-values');
    values = values.substring(1, values.length - 1);
    let vals = values.split(',');

    let rect = this.getBoundingClientRect();

    div = dom.create('div');
    div.setAttribute('sde-select', true);
    div.style.zIndex = '99999999';
    div.style.position = 'absolute';
    div.style.top = '0px';
    div.style.left = (this.parentElement.offsetLeft + 60) + 'px';

    let ul = dom.create('ul');
    ul.style.backgroundColor = '#fefefe';
    ul.style.border = '1px solid #ccc';
    ul.style.listStyleType = 'none';
    ul.style.padding = '0px';
    ul.style.margin = '0px';

    let trigger = this;
    let strs = trigger.innerText.split('、');

    for (let i = 0; i < vals.length; i++) {
      let li = dom.create('li');
      li.setAttribute('data-sde-selected', 'false');
      li.style.padding = '0 10px';
      li.style.color = '#666';
      li.style.fontSize = '12px';
      li.style.lineHeight = '2rem';
      li.style.width = '100%';
      li.style.cursor = 'pointer';
      li.style.whiteSpace='nowrap';
      li.innerText = vals[i];
      for (let j = 0; j < strs.length; j++) {
        if (li.innerText === strs[j]) {
          li.style.background = '#efefef';
          li.setAttribute('data-sde-selected', 'true');
          break;
        }
      }
      dom.bind(li, 'click', function(ev) {
        ev.stopPropagation();

        if (trigger.innerText == label) {
          trigger.innerText = '';
        }

        let strs = trigger.innerText.split('、');
        trigger.style.color = 'black';
        let _par = trigger.parentElement.parentElement;
        _par.dataset.nodata='false';
        // 检查是否已经选了
        if (this.getAttribute('data-sde-selected') == 'false') {
          this.style.background = '#efefef';
          if (trigger.innerText.trim() !== '') {
            trigger.innerText += '、';
          }
          trigger.innerText += this.innerText;
          this.setAttribute('data-sde-selected', 'true');
        } else {
          this.style.background = '#fefefe';
          trigger.innerText = '';

          for (let i = 0; i < strs.length; i++) {
            if (this.innerText === strs[i]) continue;
            if (trigger.innerText.trim() !== '') {
              trigger.innerText += '、';
            }
            trigger.innerText += strs[i];
          }
          if (trigger.innerText == '') {
            trigger.innerText = label;
            trigger.style.color = '#FF8080';
          }
          this.setAttribute('data-sde-selected', 'false');
        }

        // 检查选择后的处罚条件
        let par = trigger.parentElement.parentElement;
        par.children.forEach(function(el, idx) {
          let visible = el.getAttribute('data-sde-visible');
          if (visible) {
            let strs = visible.split('==');
            if (trigger.getAttribute('data-sde-name') == strs[0] && trigger.innerText == strs[1]) {
              el.style.display = '';
            } else {
              el.style.display = 'none';
            }
          }
        });
      });
      ul.appendChild(li);
    }
    div.appendChild(ul);
    this.parentElement.appendChild(div);
    // 重新调整位置
    let rectDiv = div.getBoundingClientRect();
    let containerHeight = dom.find('.right-bar').getBoundingClientRect().height;
    let containerWidth = self.container.getBoundingClientRect().width;
    if (containerHeight < (rectDiv.top + this.scrollTop + rectDiv.height),rectDiv,rectDiv.width) {
      // div.style.top = (containerHeight - rectDiv.height) + 'px';
      // console.log(div.style.top);
    }
    let _container=dom.find('.right-bar').getBoundingClientRect()
    if(_container.right < rectDiv.right){
      div.style.right ='0px';
      div.style.left = 'auto';
    }
  });
};

StructuredDataEntry.prototype.getEntries = function () {
  let sdes = this.container.querySelectorAll('span[data-sde-name]');
  let ret = [];
  for (let sde of sdes) {
    ret.push({
      name: sde.getAttribute('data-sde-name'),
      value: sde.innerText,
    })
  }
  return ret;
};

StructuredDataEntry.prototype.getParams = function () {
  let sdes = this.container.querySelectorAll('span[data-sde-param]');
  let ret = {};
  for (let sde of sdes) {
    ret[sde.getAttribute('data-sde-param')] = sde.getAttribute('data-sde-value');
  }
  return ret;
};

StructuredDataEntry.prototype.autofill = function (name, value) {
  let spans = this.container.querySelectorAll(`span[data-sde-name="${name}"]`);
  for (let span of spans) {
    span.innerText = '【' + (value || '') + '】';
  }
};

StructuredDataEntry.prototype.createPopupSelect = function (el, vals, width) {
  let label = el.getAttribute('data-sde-label');
  let field = el.getAttribute('data-sde-field');
  let self = this;
  let ret = dom.create('div');
  ret.style.zIndex = 999999999;
  ret.setAttribute('sde-select', true);
  ret.setAttribute('contenteditable', false);
  ret.style.position = 'absolute';
  ret.style.top = '0px';
  ret.style.overflowY = 'auto';
  ret.style.maxHeight = '300px';
  ret.style.left = (el.parentElement.offsetLeft + 60) + 'px';

  let ul = dom.create('ul');
  ul.style.backgroundColor = '#fefefe';
  ul.style.border = '1px solid #ccc';
  ul.style.listStyleType = 'none';
  ul.style.padding = '0px';
  ul.style.margin = '0px';

  if (width) {
    ul.style.display = 'flex';
    ul.style.flexDirection = 'row';
    ul.style.flexWrap = 'wrap';
    ul.style.width = '200px';
  }

  let trigger = el;
  for (let i = 0; i < vals.length; i++) {
    let li = dom.create('li');
    li.style.padding = '0 10px';
    li.style.color = '#666';
    li.style.fontSize = '12px';
    li.style.lineHeight = '2rem';
    if (width) {
      li.style.width = width;
    } else {
      li.style.width = '100%';
    }
    li.style.whiteSpace='nowrap';

    if (typeof vals[i] === 'string' || typeof vals[i] === 'number') {
      li.innerText = vals[i];
    } else {
      dom.model(li, vals[i]);
      li.innerText = vals[i][field];
    }
    li.style.cursor = 'pointer';
    dom.bind(li, 'click', function() {
      trigger.innerText = li.innerText;
      trigger.style.color = 'black';
      let par = trigger.parentElement.parentElement;
      par.dataset.nodata='false';
      if (par.children.forEach) {
        par.children.forEach(function (el, idx) {
          let visible = el.getAttribute('data-sde-visible');
          if (visible) {
            let strs = visible.split('==');
            if (trigger.getAttribute('data-sde-name') == strs[0] && trigger.innerText == strs[1]) {
              el.style.display = '';
            } else {
              el.style.display = 'none';
            }
          }
        });
      }
      if (self.onInput) {
        self.onInput(trigger.getAttribute('data-sde-name'), li.innerText, dom.model(li));
      }
      ret.remove();
    });
    ul.appendChild(li);
  }
  ret.appendChild(ul);
  return ret;
};

StructuredDataEntry.prototype.positionPopup = function (trigger, tooltip) {
  // let pageX = ev.pageX;
  // let pageY = ev.pageY;
  // if (pageY < 300) {
  //   return {
  //     top: pageY - 100 + 32,
  //     left: pageX,
  //   };
  // }
  //
  // return {
  //   top: pageY - 200 + 32,
  //   left: pageX,
  // }
  if (this.popperInstance) {
    this.popperInstance.destroy();
    this.popperInstance = null;
  }
  this.popperInstance = Popper.createPopper(trigger, tooltip, {
    placement: "auto",
    modifiers: [{
      name: "offset",
      options: {
        offset: [0, 8]
      }
    },{
      name: "flip", //flips popper with allowed placements
      options: {
        allowedAutoPlacements: ["right", "left", "top", "bottom"],
        rootBoundary: "viewport"
      }
    }]
  });
};



