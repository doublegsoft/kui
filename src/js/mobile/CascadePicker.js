
/*!
** @param opt
**        配置项，包括以下选项：
**        unit：单位
*/
function CascadePicker(opt) {
  this.success = opt.success || function (vals) {};
  this.selections = opt.selections || {};
  this.levels = opt.levels;
}

CascadePicker.prototype.root = function () {
  let ret = dom.templatize(`
    <div class="popup-container">
      <div class="popup-mask"></div>
      <div class="popup-bottom district-picker">
        <div class="popup-title">
          <button class="cancel">取消</button>
          <span class="value"></span>
          <span class="unit">{{unit}}</span>
          <button class="confirm">确认</button>
        </div>
        <div>
          <div widget-id="widgetLevel" style="padding: 4px 16px">
          </div>
          <div style="border-top: 1px solid var(--color-divider);"></div>
          <ul widget-id="widgetValue" class="list-group" style="height: 240px; overflow-y: auto;">
          </ul>
        </div>
      </div>
    </div>
  `, this);
  this.bottom = dom.find('.popup-bottom', ret);
  this.widgetLevel = dom.find('[widget-id=widgetLevel]', ret);
  this.widgetValue = dom.find('[widget-id=widgetValue]', ret);

  let mask = dom.find('.popup-mask', ret);
  let confirm = dom.find('.confirm', ret);
  let cancel = dom.find('.cancel', ret);

  let onSelectionClicked = ev => {
    let div = dom.ancestor(ev.target, 'div');
    let strong = dom.find('strong', div);
    let level = parseInt(strong.getAttribute('data-cascade-level'));
    let value = strong.getAttribute('data-cascade-value');
    let name = strong.getAttribute('data-cascade-name');
    let params = null;

    let  elPrev = dom.find('[data-cascade-level="' + (level - 1) + '"]', this.widgetLevel);
    if (elPrev != null) {
      let prevValue = elPrev.getAttribute('data-cascade-value');
      let prevName = elPrev.getAttribute('data-cascade-name');
      params = {};
      params[prevName] = prevValue;
    }
    this.renderValue(level, params);

    for (let i = level + 1; i < this.levels.length; i++) {
      let  elNext = dom.find('[data-cascade-level="' + i + '"]', this.widgetLevel);
      elNext.setAttribute('data-cascade-value', '');
      elNext.innerText = this.levels[i].placeholder;
    }
  }

  for (let i = 0; i < this.levels.length; i++) {
    let el = dom.templatize(`
      <div class="d-flex" style="line-height: 40px;">
        <strong data-cascade-level="${i}" data-cascade-name="{{name}}" class="font-16">{{placeholder}}</strong>
        <span class="ml-auto material-icons font-18 position-relative" style="top: 12px;">navigate_next</span>
      </div>
    `, this.levels[i]);
    this.widgetLevel.appendChild(el);

    dom.bind(el, 'click', ev => {
      onSelectionClicked(ev);
    });
  }

  dom.bind(mask, 'click', ev => {
    this.close();
  });

  dom.bind(cancel, 'click', ev => {
    this.close();
  });

  dom.bind(confirm, 'click', ev => {
    let strongs = dom.find('strong', this.widgetLevel);
    let vals = {};
    for (let i = 0; i < strongs.length; i++) {
      let strong = strongs[i];
      let model = dom.model(strong);
      vals[strong.getAttribute('data-cascade-name')] = model;
    }
    this.success(vals);
    this.close();
  });

  setTimeout(() => {
    this.bottom.classList.add('in');
  }, 50);
  return ret;
};

CascadePicker.prototype.renderValue = async function(level, params, selected) {
  let elLevel = dom.find('[data-cascade-level="' + level + '"]', this.widgetLevel);
  if (elLevel == null) {
    return;
  }
  let optLevel = this.levels[level];
  this.widgetValue.innerHTML = '';

  if (!optLevel.url) {
    return;
  }
  if (typeof optLevel.params === 'function') {
    params = optLevel.params(params);
  } else {
    params = optLevel.params;
  }
  let rows = await xhr.promise({
    url: optLevel.url,
    params: params,
  });
  for (let i = 0; i < rows.length; i++) {
    let data = {
      value: rows[i][optLevel.fields.value],
      text: rows[i][optLevel.fields.text],
    };
    let el = dom.templatize(`
      <li class="list-group-item" data-cascade-value="{{value}}">{{text}}</li>
    `, data);
    dom.model(el, rows[i]);
    dom.bind(el, 'click', ev => {
      let li = dom.ancestor(ev.target, 'li');
      let model = dom.model(li);
      elLevel.innerText = model[optLevel.fields.text];
      elLevel.setAttribute('data-cascade-value', model[optLevel.fields.value]);
      dom.model(elLevel, model);
      let newParams = {};
      newParams[optLevel.fields.value] = model[optLevel.fields.value];
      this.renderValue(level + 1, newParams, model);
    });
    this.widgetValue.appendChild(el);
  }
};

CascadePicker.prototype.show = function(container) {
  container.appendChild(this.root());
  this.renderValue(0);
};

CascadePicker.prototype.close = function() {
  this.bottom.classList.remove('in');
  this.bottom.classList.add('out');
  setTimeout(() => {
    this.bottom.parentElement.remove();
  }, 300);
};