
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

PropertiesEditor.prototype.addPropertyChangedListener = function (listener) {
  this.propertyChangedListeners.push(listener);
};

PropertiesEditor.prototype.notifyPropertyChangedListeners = function (prop) {
  for (let i = 0; i < this.propertyChangedListeners.length; i++) {
    this.propertyChangedListeners[i].onPropertyChanged(prop);
  }
};

PropertiesEditor.prototype.onModelChanged = function (model) {
  this.setData(model);
};

PropertiesEditor.prototype.clear = function (prop) {
  let container = document.getElementById(this.containerId);
  container.innerHTML = '';
};

/**
 * 在父容器下渲染属性编辑器。
 * 
 * @since 1.0
 */
PropertiesEditor.prototype.render = function(element) {
  let self = this;
  let elementProperties = element.getProperties();
  let container = document.getElementById(this.containerId);
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
    for (let j = 0; j < props.length; j++) {
      let prop = props[j];
      let divProp = document.createElement('div');
      divProp.classList.add('group-item');
      let labelProp = document.createElement('label');
      labelProp.classList.add('group-item-label');
      labelProp.textContent = prop.label + '：';
      divProp.append(labelProp);

      let divInput = document.createElement('div');
      if (prop.input == 'textarea') {
        //
        // 【文本】
        //
        let textarea = document.createElement('textarea');
        textarea.setAttribute('data-id', prop.id);
        textarea.classList.add('group-item-input');
        textarea.textContent = prop.value || '';

        textarea.addEventListener('keyup', function (evt) {
          let changed = {};
          changed[prop.id] = textarea.value;
          self.notifyPropertyChangedListeners(changed);
        });

        divProp.append(textarea);
      } else if (prop.input == 'range') {
        //
        // 【区域值】
        //
        let input = document.createElement('input');
        input.setAttribute('data-id', prop.id);
        input.setAttribute('type', 'range');
        input.setAttribute('step', '1');
        input.setAttribute('min', prop.min);
        input.setAttribute('max', prop.max);
        input.setAttribute('data-unit', prop.unit);
        input.valueAsNumber = prop.value;
        input.classList.add('group-item-input');
        labelProp.textContent = prop.label + '：' + prop.value + prop.unit;
        divProp.append(input);

        // 事件绑定，随时变化显示值
        input.addEventListener('change', function(evt) {
          labelProp.textContent = prop.label + '：' + input.valueAsNumber + prop.unit;
          let changed = {};
          changed[prop.id] = input.valueAsNumber;
          self.notifyPropertyChangedListeners(changed);
        });
        input.addEventListener('input', function(evt) {
          labelProp.textContent = prop.label + '：' + input.valueAsNumber + prop.unit;
          let changed = {};
          changed[prop.id] = input.valueAsNumber;
          self.notifyPropertyChangedListeners(changed);
        });

      } else if (prop.input == 'select') {
        //
        // 【下拉框】
        //
        let select = document.createElement('select');
        select.setAttribute('data-id', prop.id);
        select.style.display = 'block';
        select.classList.add('group-item-input');
        for (let i = 0; i < prop.values.length; i++) {
          let option = document.createElement('option');
          option.value = prop.values[i];
          option.textContent = prop.values[i];
          if (prop.values[i] == prop.value) {
            option.selected = true;
          }
          select.append(option);
        }
        divProp.append(select);

        select.addEventListener('change', function(evt) {
          let changed = {};
          changed[prop.id] = select.value;
          self.notifyPropertyChangedListeners(changed);
        });

      } else if (prop.input == 'number') {
        //
        // 【数字】
        //
        let input = document.createElement('input');
        input.setAttribute('data-id', prop.id);
        input.value = parseInt(prop.value);
        input.classList.add('group-item-input');
        divProp.append(input);

        input.addEventListener('input', function(evt) {
          if (isNaN(parseFloat(this.value))) return;
          let changed = {};
          changed[prop.id] = parseFloat(this.value);
          console.log(changed);
          self.notifyPropertyChangedListeners(changed);
        });
      } else if (prop.input == 'color') {
        //
        // 【颜色】
        //
        let input = document.createElement('input');
        input.setAttribute('type', 'color');
        input.setAttribute('data-id', prop.id);
        input.value = prop.value;
        input.classList.add('group-item-input');
        divProp.append(input);

        input.addEventListener('input', function(evt) {
          let changed = {};
          changed[prop.id] = input.value;
          self.notifyPropertyChangedListeners(changed);
        });
      } else if (prop.input == 'file') {
        //
        // 【文件】
        //
        let input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('data-id', prop.id);
        input.value = prop.value;
        input.classList.add('group-item-input');
        divProp.append(input);

        input.addEventListener('input', function(evt) {
          let reader = new FileReader();
          reader.onloadend = function () {
            let changed = {};
            changed[prop.id] = reader.result;
            self.notifyPropertyChangedListeners(changed);
          };
          reader.readAsDataURL(this.files[0]);

        });
      } else if (prop.display) {
        //
        // 【自定义】
        //
        divProp.append(prop.display(prop.value));
      }
      divProp.append(divInput);

      divProps.append(divProp);
    }
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

PropertiesEditor.prototype.getData = function () {
  let container = document.getElementById(this.containerId);
  let inputs = container.querySelectorAll('input');
  let selects = container.querySelectorAll('select');
  let textareas = container.querySelectorAll('textarea');
  let ret = {};
  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];
    let dataId = input.getAttribute('data-id');
    let dataValue = input.value;
    ret[dataId] = dataValue;
  }
  for (let i = 0; i < selects.length; i++) {
    let select = selects[i];
    let dataId = select.getAttribute('data-id');
    let dataValue = select.value;
    ret[dataId] = dataValue;
  }
  for (let i = 0; i < inputs.length; i++) {
    let textarea = textareas[i];
    let dataId = textarea.getAttribute('data-id');
    let dataValue = textarea.textContent;
    ret[dataId] = dataValue;
  }
  return ret;
};

PropertiesEditor.prototype.setData = function (data) {
  let container = document.getElementById(this.containerId);
  let inputs = container.querySelectorAll('input');
  let selects = container.querySelectorAll('select');
  let textareas = container.querySelectorAll('textarea');

  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];
    let dataId = input.getAttribute('data-id');
    if (data[dataId]) {
      // 特殊处理BUG
      if (dataId == 'x') data[dataId] = parseInt(data[dataId]);
      if (dataId != 'image')
        input.value = data[dataId];
    }
  }
  for (let i = 0; i < selects.length; i++) {
    let select = selects[i];
    let dataId = select.getAttribute('data-id');
    if (data[dataId])
      select.value = data[dataId];
  }
  for (let i = 0; i < textareas.length; i++) {
    let textarea = textareas[i];
    let dataId = textarea.getAttribute('data-id');
    if (data[dataId])
      textarea.textContent = data[dataId];
  }
};