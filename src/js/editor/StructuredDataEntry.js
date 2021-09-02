function StructuredDataEntry(opts) {
  if (opts && opts.container) {
    this.container = dom.find(opts.container);
  }
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

    } else if (input === 'multiselect') {
      el.classList.add('pointer');
      self.bindMultiselectInput(el);
    } else {
      el.setAttribute('contenteditable', true);
      self.bindNumberInput(el);
    }
    if (data[el.getAttribute('data-sde-name')]) {
      let _value=data[el.getAttribute('data-sde-name')];
      let selectvalue=el.getAttribute('data-sde-values');
      let trigger = el;
      let par = trigger.parentElement.parentElement;
      console.log(data,_value,selectvalue);
      if(input=='number'&&data[el.getAttribute('data-sde-name')]!=0
        || input=='select'&&selectvalue.indexOf(_value)>-1
        || input=='multiselect' && _value.length>0
        || input=='text'&&data[el.getAttribute('data-sde-name')]!=el.getAttribute('data-sde-label') ){
        el.classList.remove('sde-input-default');
        el.innerText = data[el.getAttribute('data-sde-name')];
        par.dataset.nodata='false';
      }
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
};

StructuredDataEntry.prototype.bindSelectInput = function(el) {
  dom.bind(el, 'click', function(ev) {
    ev.stopPropagation();

    let div = dom.find('[sde-select]');
    if (div != null) div.remove();

    let values = this.getAttribute('data-sde-values');
    values = values.substring(1, values.length - 1);
    let vals = values.split(',');

    let rectThis = this.getBoundingClientRect();
    let rectParent = this.parentElement.getBoundingClientRect();

    div = dom.create('div');
    div.style.zIndex = 999999999;
    div.setAttribute('sde-select', true);
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
    for (let i = 0; i < vals.length; i++) {
      let li = dom.create('li');
      li.style.padding = '0 10px';
      li.style.color = '#666';
      li.style.fontSize = '12px';
      li.style.lineHeight = '2rem';
      li.style.width = '100%';
			li.style.whiteSpace='nowrap';
      li.innerText = vals[i];
      li.style.cursor = 'pointer';
      dom.bind(li, 'click', function() {
        trigger.innerText = li.innerText;
        trigger.style.color = 'black';
        var par = trigger.parentElement.parentElement;
        par.dataset.nodata='false';
        par.children.forEach(function(el, idx) {
          var visible = el.getAttribute('data-sde-visible');
          if (visible) {
            let strs = visible.split('==');
            if (trigger.getAttribute('data-sde-name') == strs[0] && trigger.innerText == strs[1]) {
              el.style.display = '';
            } else {
              el.style.display = 'none';
            }
          }
        });
        div.remove();
      });
      ul.appendChild(li);
    }
		div.appendChild(ul);
		this.parentElement.appendChild(div);
    // 重新调整位置
    let rectDiv = div.getBoundingClientRect();
    let containerHeight = self.container.getBoundingClientRect().height;
    let containerWidth = self.container.getBoundingClientRect().width;
    if (containerHeight < (rectDiv.top + rectDiv.height)) {
      // div.style.top = (containerHeight - rectDiv.height ) + 'px';
    }
    if (containerWidth < (rectDiv.left)) {
      div.style.left = (this.parentElement.offsetLeft) + 'px';
    }
		let _container=dom.find('.right-bar').getBoundingClientRect()
    if(_container.right < rectDiv.right){
			div.style.right ='0px';
			div.style.left = 'auto';
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

