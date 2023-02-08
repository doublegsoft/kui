
/**
 * 属性编辑器构造函数。
 * <p>
 * 参数包括：
 * 1. containerId     容器的DOM标识
 * 2. properties      属性数组配置项
 *   2.1. id          属性的编辑标识
 *   2.2. label       属性的显示文本
 *   2.3. input       属性的输入类型，可以为text或者dialog
 *   2.4. readonly    属性编辑框不可编辑，为只读 
 *   2.5. display     属性在输入框中的显示内容
 * 3. confirm         对话框确认后的回调函数
 * 
 * @param {object} options
 *        属性编辑器的构造参数
 * 
 * @since 1.0
 */
function PropertiesEditor(options) {
  this.containerId = options.containerId;
  this.confirm = options.confirm || function () {};
  this.propertyChangedListeners = [];
}

PropertiesEditor.getPropertiesValues = function(model) {
  let ret = {};
  for (let i = 0; i < model.groups.length; i++) {
    let group = model.groups[i];
    for (let j = 0; j < group.properties.length; j++) {
      let prop = group.properties[j];
      if (Array.isArray(prop.value)) {
        ret[prop.name] = [];
        let item = {};
        for (let m = 0; m < prop.value.length; m++) {
          let itemProp = prop.value[m];
          item[itemProp.name] = itemProp.value;
          ret[prop.name].push(item);
        }
      } else {
        ret[prop.name] = prop.value || '';
      }
    }
  }
  return ret;
};

PropertiesEditor.prototype.addPropertyChangedListener = function (listener) {
  this.propertyChangedListeners.push(listener);
};

PropertiesEditor.prototype.notifyPropertyChangedListeners = function (prop) {
  for (let i = 0; i < this.propertyChangedListeners.length; i++) {
    this.propertyChangedListeners[i].onPropertyChanged(prop);
  }
};

PropertiesEditor.prototype.onModelChanged = function (model) {
  this.setPropertiesValues(model);
};

PropertiesEditor.prototype.clear = function (prop) {
  let container = dom.find(this.containerId);
  container.innerHTML = '';
};

/**
 * 在父容器下渲染属性编辑器。
 * 
 * @since 1.0
 */
PropertiesEditor.prototype.render = function(element) {
  let self = this;
  let elementProperties = [];
  if (element.getProperties) elementProperties = element.getProperties();
  else elementProperties = element.groups;

  if (!elementProperties) {
    elementProperties = [];
  }

  let container = dom.find(this.containerId);
  container.innerHTML = '';
  for (let i = 0; i < elementProperties.length; i++) {
    let group = elementProperties[i];
    let divGroup = document.createElement('div');
    divGroup.classList.add('group');

    let h3Group = document.createElement('h3');
    h3Group.classList.add('group-title');

    let linkGroup = document.createElement('a');
    let iconGroup = document.createElement('i');

    linkGroup.classList.add('btn', 'btn-link');
    iconGroup.classList.add('icon-minus');

    linkGroup.append(iconGroup);
    h3Group.append(linkGroup);
    h3Group.append(group.title);
    divGroup.append(h3Group);

    container.append(divGroup);

    let props = group.properties || [];
    let divProps = document.createElement('div');
    divProps.classList.add('group-body');
    divProps.style.display = '';

    this.renderProperties(divProps, props);
    divGroup.append(divProps);

    linkGroup.addEventListener('click', function() {
      let icon = this.querySelector('i');
      if (icon.classList.contains('icon-plus')) {
        divProps.style.display = '';
        icon.classList.remove('icon-plus');
        icon.classList.add('icon-minus');
      } else {
        divProps.style.display = 'none';
        icon.classList.remove('icon-minus');
        icon.classList.add('icon-plus');
      }
    });
  }
};

PropertiesEditor.prototype.renderProperties = function(container, properties) {
  let self = this;
  for (let j = 0; j < properties.length; j++) {
    let prop = properties[j];
    let divProp = document.createElement('div');
    divProp.classList.add('group-item');
    let labelProp = document.createElement('label');
    labelProp.classList.add('group-item-label');
    labelProp.textContent = (prop.label || prop.title) + '：';
    divProp.append(labelProp);

    let divInput = document.createElement('div');
    if (prop.input == 'textarea' || prop.input == 'longtext') {
      //
      // 【文本】
      //
      let textarea = document.createElement('textarea');
      textarea.setAttribute('property-model-name', prop.name);
      textarea.classList.add('group-item-input');
      textarea.textContent = prop.value || '';

      textarea.addEventListener('keyup', function (evt) {
        let changed = {};
        changed[prop.name] = textarea.value;
        self.notifyPropertyChangedListeners(changed);
      });

      divProp.append(textarea);
    } else if (prop.input == 'range') {
      //
      // 【区域值】
      //
      let input = document.createElement('input');
      input.setAttribute('property-model-name', prop.name);
      input.setAttribute('type', 'range');
      input.setAttribute('step', '1');
      input.setAttribute('min', prop.min);
      input.setAttribute('max', prop.max);
      input.setAttribute('data-unit', prop.unit);
      input.valueAsNumber = prop.value;
      input.classList.add('group-item-input');
      labelProp.textContent = (prop.label || prop.title) + '：' + prop.value + prop.unit;
      divProp.append(input);

      // 事件绑定，随时变化显示值
      input.addEventListener('change', function(evt) {
        labelProp.textContent = (prop.label || prop.title) + '：' + input.valueAsNumber + prop.unit;
        let changed = {};
        changed[prop.name] = input.valueAsNumber;
        self.notifyPropertyChangedListeners(changed);
      });
      input.addEventListener('input', function(evt) {
        labelProp.textContent = (prop.label || prop.title) + '：' + input.valueAsNumber + prop.unit;
        let changed = {};
        changed[prop.name] = input.valueAsNumber;
        self.notifyPropertyChangedListeners(changed);
      });

    } else if (prop.input == 'select') {
      //
      // 【下拉框】
      //
      let select = document.createElement('select');
      select.setAttribute('property-model-name', prop.name);
      select.style.display = 'block';
      select.classList.add('group-item-input');
      for (let i = 0; i < prop.values.length; i++) {
        let option = document.createElement('option');
        option.value = prop.values[i].value;
        option.textContent = prop.values[i].text;
        if (prop.values[i].value == prop.value) {
          option.selected = true;
        }
        select.append(option);
      }
      divProp.append(select);

      select.addEventListener('change', function(evt) {
        self.notifyPropertyChangedInArrayOrNot(evt.target, prop);
      });
    } else if (prop.input == 'number') {
      //
      // 【数字】
      //
      let input = document.createElement('input');
      input.setAttribute('property-model-name', prop.name);
      input.value = parseInt(prop.value);
      input.classList.add('group-item-input');
      divProp.append(input);

      input.addEventListener('input', function(evt) {
        if (isNaN(parseFloat(this.value))) return;
        let changed = {};
        changed[prop.name] = parseFloat(this.value);
        self.notifyPropertyChangedListeners(changed);
      });
    } else if (prop.input == 'color') {
      //
      // 【颜色】
      //
      let input = document.createElement('input');
      input.setAttribute('type', 'color');
      input.setAttribute('property-model-name', prop.name);
      input.value = prop.value;
      input.classList.add('group-item-input');
      divProp.append(input);

      input.addEventListener('input', function(evt) {
        // let changed = {};
        // changed[prop.name] = input.value;
        // self.notifyPropertyChangedListeners(changed);
        let input = evt.target;
        let changed = {};
        if (input.parentElement.parentElement.tagName === 'LI') {
          let li = input.parentElement.parentElement;
          let ul = li.parentElement;
          let parentName = ul.getAttribute('property-model-name');
          let nodes = Array.prototype.slice.call(ul.children);
          changed._index = nodes.indexOf(li);
          changed._name = parentName;
          changed[parentName] = {};
          changed[parentName][prop.name] = input.value;
        } else {
          changed[prop.name] = input.value;
        };
        self.notifyPropertyChangedListeners(changed);
      });
    } else if (prop.input == 'file') {
      //
      // 【文件】
      //
      let input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('property-model-name', prop.name);
      input.classList.add('group-item-input');
      divProp.appendChild(input);
      input.value = prop.value || '';

      input.addEventListener('input', function(evt) {
        let reader = new FileReader();
        reader.onloadend = function () {
          let changed = {};
          changed[prop.name] = reader.result;
          self.notifyPropertyChangedListeners(changed);
        };
        reader.readAsDataURL(this.files[0]);
      });
    } else if (prop.input === 'bool') {
      let input = dom.element(`
        <div class="d-flex full-width">
          <label class="c-switch c-switch-label c-switch-pill c-switch-info mt-1" style="min-width: 48px;">
            <input class="c-switch-input" type="checkbox">
            <span class="c-switch-slider" data-checked="是" data-unchecked="否"></span>
          </label>
        </div>
      `);
      if (prop.value == 'T') {
        input.children[0].children[0].checked = true;
      }
      dom.find('input', input).setAttribute('property-model-name', prop.name);
      divProp.append(input);
      input.addEventListener('click', function(evt) {
        let div = dom.ancestor(evt.target, 'div');
        let input = dom.find('input', div);
        input.checked = !input.checked;
        let changed = {};
        changed[prop.name] = input.checked;
        self.notifyPropertyChangedListeners(changed);
      });
    } else if (prop.input == 'tileselect') {
      let templateData = {
        tileStyle: 'position: relative; left: 40px; width: 360px; -moz-transform: scale(0.6); zoom: 0.6;'
      };
      let input = dom.templatize(`
        <div style="display: unset;">
          <a class="btn-link text-white pointer">选择瓦片</a>
        </div>
      `, templateData);
      dom.bind(dom.find('a', input), 'click', ev => {
        dialog.view({
          url: prop.url,
          success: prop.success,
          onClosed: (data) => {
            tile.innerHTML = data;
            let emit = {};
            emit[prop.name] = data;
            this.notifyPropertyChangedListeners(emit);
          }
        });
      });
      labelProp.append(input);
      let tile = dom.templatize(`
        <div style="position: relative; left: -100px; min-height: 64px; width: 400px; 
                    -moz-transform: scale(0.6);  zoom: 0.6; margin-top: 12px;"
             property-model-name="{{name}}">
        </div>
      `, prop);
      divProp.appendChild(tile);
    } else if (prop.display) {
      //
      // 【自定义】
      //
      divProp.append(prop.display(prop.value));
    } else if (prop.input === 'readonly') {
      let input = document.createElement('input');
      input.setAttribute('readonly', true);
      input.setAttribute('property-model-name', prop.name || prop.name);
      input.value = prop.value || '';
      input.classList.add('group-item-input');
      divProp.append(input);
    } else if (prop.input === 'array') {
      let plus = dom.element(`
        <span class="material-icons pointer position-relative font-16" style="float: right; top: 1px;">playlist_add</span>
      `);
      labelProp.appendChild(plus);
      let ul = dom.element(`
        <ul class="list-group properties-container">
        </ul>
      `);
      ul.setAttribute('property-model-name', prop.name);
      ul.setAttribute('properties-model', JSON.stringify(prop.properties));
      divProp.append(ul);

      dom.bind(plus, 'click', ev => {
        let ul = dom.ancestor(ev.target, 'div', 'group-item').children[1];
        let propertiesModel = JSON.parse(ul.getAttribute('properties-model'));
        this.appendPropertyItem(ul, propertiesModel, {});

        // 增加数组属性的一项
        let appended = {
          _index: -1,
          _action: 'append',
          _name: ul.getAttribute('property-model-name'),
        };
        this.notifyPropertyChangedListeners(appended);
      });
    } else {
      // 文本框
      let input = document.createElement('input');
      input.setAttribute('property-model-name', prop.name || prop.name);
      input.value = prop.value || '';
      input.classList.add('group-item-input');
      divProp.append(input);
      input.addEventListener('change', function(evt) {
        self.notifyPropertyChangedInArrayOrNot(evt.target, prop);
      });
    }
    divProp.append(divInput);
    container.append(divProp);
  }
};

PropertiesEditor.prototype.notifyPropertyChangedInArrayOrNot = function (input, prop) {
  let changed = {};
  if (input.parentElement.parentElement.tagName === 'LI') {
    let li = input.parentElement.parentElement;
    let ul = li.parentElement;
    let parentName = ul.getAttribute('property-model-name');
    let nodes = Array.prototype.slice.call(ul.children);
    changed._index = nodes.indexOf(li);
    changed._name = parentName;
    changed[parentName] = {};
    changed[parentName][prop.name] = input.value;
  } else {
    changed[prop.name] = input.value;
  };
  this.notifyPropertyChangedListeners(changed);
}

PropertiesEditor.prototype.appendPropertyItem = function (ul, propertiesModel, values) {
  let li = dom.element(`
    <li class="list-group-item p-0" style="background-color: #383b61;"></li>
  `);
  for (let m = 0; m < propertiesModel.length; m++) {
    propertiesModel[m].value = values[propertiesModel[m].name] || '';
  }
  this.renderProperties(li, propertiesModel);
  let buttons = dom.element(`
    <div class="full-width d-flex mt-2">
      <a class="pointer text-danger ml-auto font-18">
        <span class="material-icons">highlight_off</span>
      </a>
    </div>
  `);
  // 删除数组属性的某一项
  dom.bind(buttons.children[0], 'click', ev => {
    let a = dom.ancestor(ev.target, 'a');
    if (a.parentElement.parentElement.tagName === 'LI') {
      let li = a.parentElement.parentElement;
      let ul = li.parentElement;
      let nodes = Array.prototype.slice.call(ul.children);
      let removed = {
        _index: nodes.indexOf(li),
        _action: 'remove',
        _name: ul.getAttribute('property-model-name'),
      };
      this.notifyPropertyChangedListeners(removed);
    }
    a.parentElement.parentElement.remove();
  });
  li.appendChild(buttons);
  ul.appendChild(li);
};

PropertiesEditor.prototype.getPropertiesValues = function () {
  let container = dom.find(this.containerId);
  let inputs = container.querySelectorAll('input');
  let selects = container.querySelectorAll('select');
  let textareas = container.querySelectorAll('textarea');
  let divs = container.querySelectorAll('div[property-model-name]')
  let ret = {};
  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];
    let dataId = input.getAttribute('property-model-name');
    let dataValue = input.value;
    ret[dataId] = dataValue;
  }
  for (let i = 0; i < selects.length; i++) {
    let select = selects[i];
    let dataId = select.getAttribute('property-model-name');
    let dataValue = select.value;
    ret[dataId] = dataValue;
  }
  for (let i = 0; i < textareas.length; i++) {
    let textarea = textareas[i];
    let dataId = textarea.getAttribute('property-model-name');
    let dataValue = textarea.textContent;
    ret[dataId] = dataValue;
  }
  for (let i = 0; i < divs.length; i++) {
    let div = divs[i];
    let dataId = div.getAttribute('property-model-name');
    let dataValue = div.innerHTML;
    ret[dataId] = dataValue;
  }
  return ret;
};

PropertiesEditor.prototype.setPropertiesValues = function (data) {
  let container = dom.find(this.containerId);
  let inputs = container.querySelectorAll('input');
  let selects = container.querySelectorAll('select');
  let textareas = container.querySelectorAll('textarea');
  let divs = container.querySelectorAll('div[property-model-name]');
  let uls = container.querySelectorAll('ul[properties-model]');

  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];
    let dataId = input.getAttribute('property-model-name');
    if (input.type === 'checkbox') {
      input.checked = data[dataId] === true;
    } else if (data[dataId]) {
      // 特殊处理BUG
      if (dataId == 'x') data[dataId] = parseInt(data[dataId]);
      if (dataId.indexOf('image') == -1 && dataId.indexOf('Image') == -1)
        input.value = data[dataId];
    }
    if (input.type === 'range') {
      // FIXME
      let label = dom.find('label', input.parentElement);
      label.textContent = label.textContent.replace('undefined', data[dataId])
    }
  }
  for (let i = 0; i < selects.length; i++) {
    let select = selects[i];
    let dataId = select.getAttribute('property-model-name');
    if (data[dataId])
      select.value = data[dataId];
  }
  for (let i = 0; i < textareas.length; i++) {
    let textarea = textareas[i];
    let dataId = textarea.getAttribute('property-model-name');
    if (data[dataId])
      textarea.textContent = data[dataId];
  }
  for (let i = 0; i < divs.length; i++) {
    let div = divs[i];
    let dataId = div.getAttribute('property-model-name');
    if (data[dataId])
      div.innerHTML = data[dataId];
  }

  // 特殊列表显示
  for (let i = 0; i < uls.length; i++) {
    let ul = uls[i];
    let propName = ul.getAttribute('property-model-name');
    let propertiesModel = JSON.parse(ul.getAttribute("properties-model"));
    let values = data[propName] || [];
    for (let j = 0; j < values.length; j++) {
      this.appendPropertyItem(ul, propertiesModel, values[j]);
    }
  }
};