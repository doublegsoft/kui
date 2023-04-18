let ICON_REQUIRED = '<i class="fas fa-asterisk icon-required"></i>'//*
let ICON_GENERAL = '<i class="fas fa-question icon-general"></i>';//?
let ICON_CORRECT = '<i class="fas fa-check text-success" style="width: 10px;"></i>';//√
let ICON_ERROR = '<i class="fas fa-exclamation text-warning" style="width: 10px;"></i>';//!

function FormLayout(opts) {
  let self = this;
  this.fields = opts.fields;
  this.readonly = opts.readonly || false;
  // 判断是否保存前提示，此处是提示语
  this.confirmText = opts.confirmText || '';
  this.actions = opts.actions || [];
  this.actionable = (typeof opts.actionable === 'undefined') ? true : false;
  this.columnCount = opts.columnCount || 2;
  this.saveText = opts.saveText || '保存';
  this.savePromptText = opts.savePromptText;
  this.saveOpt = opts.save;
  this.readOpt = opts.read;
	this.mode = opts.mode || 'rightbar';
	this.onInit = opts.onInit || function() {};
  this.toast = dom.element(`
    <div class="toast fade b-a-1 text-white" data-autohide="false" 
         style="position: absolute; left: 20%; top: 10px; width: 60%; z-index: -1;">
      <div class="toast-header pt-1">
        <strong class="mr-auto p-2"></strong>
        <button type="button" class="ml-2 mb-1 mr-2 close text-white" data-dismiss="toast">&times;</button>
      </div>
      <div class="toast-body p-2"></div>
    </div>
  `);
  this.controls = {};

  dom.find('button', this.toast).addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    self.toast.classList.remove('show', 'in');
    self.toast.style.zIndex = -1;
  });

  this.variableListeners = {};
}

/**
 * Renders the form in page.
 *
 * @param containerId
 *        the container selector or itself
 *
 * @param params
 *        the request parameters
 */
FormLayout.prototype.render = async function (containerId, params) {
  this.containerId = containerId;
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }
  this.container.innerHTML = '';

  await this.fetch(params);
};

/**
 * Builds the form.
 *
 * @param persisted
 *        the persisted data which is fetching from remote data
 *
 * @private
 */
FormLayout.prototype.build = async function(persisted) {
  let self = this;
  persisted = persisted || {};
  let form = dom.create('div', 'col-md-12', 'form-horizontal');
  let columnCount = this.columnCount;
  let hiddenFields = [];
  let shownFields = [];
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    let defaultValue = field.value;
    // make default value working
    if (field.name) {
      if (field.name.indexOf("[]") != -1) {
        let name = field.name.substring(0, field.name.indexOf('[]'));
        field.value = (typeof persisted[name] === 'undefined' || persisted[name] == 'null') ? null : persisted[name];
      } else if (field.name.indexOf('.') != -1) {
        let parentName = field.name.substring(0, field.name.indexOf('.'));
        let childName = field.name.substring(field.name.indexOf('.') + 1);
        field.value = (typeof persisted[parentName] === 'undefined' || persisted[parentName] == 'null') ? null :
            (typeof persisted[parentName][childName] === 'undefined' || persisted[childName] == 'null') ? null : persisted[parentName][childName];
      } else {
        field.value = (typeof persisted[field.name] === 'undefined' || persisted[field.name] == 'null') ? null : persisted[field.name];
      }
    }
    // 默认值设置
    if (!field.value && defaultValue) {
      field.value = defaultValue;
    }
    if (field.input == 'hidden') {
      hiddenFields.push(field);
    } else {
      shownFields.push(field);
    }
  }

  let rows = [];
  let len = shownFields.length;

  let groups = [];
  let group = {
    title: '',
    fields: []
  };
  for (let i = 0; i < shownFields.length; i++) {
    let field = shownFields[i];

    // 重新分组
    if (field.input === 'title') {
      groups.push(group);
      group = {
        title: field.title,
        fields: []
      };
    } else {
      group.fields.push(field);
    }
  }

  if (group.fields.length !== 0) groups.push(group);

  // hidden fields
  for (let i = 0; i < hiddenFields.length; i++) {
    let field = hiddenFields[i];
    let hidden = dom.create('input');
    hidden.type = 'hidden';
    hidden.name = field.name;
    hidden.value = field.value;
    hidden.setAttribute('data-identifiable', field.identifiable || false);
    form.appendChild(hidden);
  }

  for (let i = 0; i < groups.length; i++) {
    let group = groups[i];
    if (group.title) {
      let el = dom.element('<div class="title-bordered" style="margin: 10px -10px;"><strong>' + group.title + '</strong></div>')
      form.appendChild(el);
    }
    let cols = 24 / columnCount;
    let row = dom.create('div', 'row', 'mx-0');
    for (let j = 0; j < group.fields.length; j++) {
      let field = group.fields[j];
      let pair = this.createInput(field, columnCount);
      let labelAndInput = dom.create('div', 'd-flex', 'col-24-' + cols, 'mx-0', 'mb-2');
      if (pair.label != null) {
        pair.label.classList.add('pl-3');
        pair.input.classList.add('pr-3');
        labelAndInput.appendChild(pair.label);
      }
      labelAndInput.appendChild(pair.input);
      row.appendChild(labelAndInput);
    }
    form.appendChild(row);
  }
  // 必须放在这里，否者后续容器会找不到
  this.container.appendChild(form);
  this.container.appendChild(this.toast);

  // ###################### //
  // 引用的第三方插件，重新渲染 //
  // ###################### //
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    if (field.input == 'date') {
      $(this.container).find('input[name=\'' + field.name + '\']').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '\']', this.container).value = moment(field.value).format('YYYY-MM-DD');
      }
    } else if (field.input == 'datetime') {
      $(this.container).find('input[name=\'' + field.name + '_date\']').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '_date\']', this.container).value = moment(field.value).format('YYYY-MM-DD');
      }

      $(this.container).find('input[name=\'' + field.name + '_time\']').datetimepicker({
        format: 'HH:mm:00',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '_time\']', this.container).value = moment(field.value).format('HH:mm:00');
      }
    } else if (field.input == 'time') {
      $(this.container).find('input[name=\'' + field.name + '\']').datetimepicker({
        format: 'hh:mm:00',
        locale: 'zh_CN',
        useCurrent: false
      });
      // 加载值或者默认值
      if (field.value != null) {
        dom.find('input[name=\'' + field.name + '\']', this.container).value = moment(field.value).format('hh:mm:00');
      }
    } else if (field.input == 'select') {
      let opts = field.options;
      opts.validate = FormLayout.validate;
      // 加载值或者默认值
      // 允许数组值
      if (Array.isArray(field.value)) {
        opts.selection = field.value[0][opts.fields.value];
      } else {
        opts.selection = field.value;
      }
      if (field.onInput) {
        opts.onchange = field.onInput;
      }
      if (field.variables) {
        opts.variables = field.variables;
        for (let key in opts.variables) {
          this.variableListeners[key] = (val) => {
            opts.variables[key] = val;
            this.controls[field.name] = $(this.container).find('select[name=\'' + field.name + '\']').searchselect(opts);
          }
        }
      }
      this.controls[field.name] = $(this.container).find('select[name=\'' + field.name + '\']').searchselect(opts);
    } else if (field.input == 'cascade') {
      let opts = field.options;
      opts.validate = FormLayout.validate;
      // 加载值或者默认值
      for (let j = 0; j < opts.levels.length; j++) {
        let level = opts.levels[j];
        if (typeof persisted[level.name] !== "undefined") {
          level.value = persisted[level.name];
        }
      }
      opts.required = field.required || false;
      if (this.readonly == true) {
        opts.readonly = true;
      }
      if (field.readonly == true) {
        opts.readonly = true;
      }
      $(this.container).find('div[data-cascade-name=\'' + field.name + '\']').cascadeselect(opts);
    } else if (field.input == 'checklist') {
      if (this.readonly == true) {
        field.options.readonly = true;
      }
      if (field.readonly == true) {
        field.options.readonly = true;
      }
      field.options.name = field.name;
      this.params = this.params || {};
      field.options.data = field.options.data || {};
      for (let key in this.params) {
        field.options.data[key] = this.params[key];
      }
      new Checklist(field.options).render(dom.find('div[data-checklist-name=\'' + field.name + '\']', this.container), {
        selections: persisted[field.name] || []
      });
    } else if (field.input == 'checktree') {
      field.options.name = field.name;
      field.options.readonly = this.readonly;
      this.params = this.params || {};
      field.options.data = field.options.data || {};
      for (let key in this.params) {
        field.options.data[key] = this.params[key];
      }
      // new Checktree(field.options).render('#checktree_' + field.name);
      this[field.name] = new TreelikeList(field.options);
      this[field.name].render(dom.find('div[data-checktree-name=\'' + field.name + '\']', this.container), field.value);
      // this[field.name].setValues(field.value);
    } else if (field.input == 'fileupload') {
      await new FileUpload({
        ...field.options,
        name: field.name,
      }).render(dom.find('div[data-fileupload-name=\'' + field.name + '\']', this.container));
    } else if (field.input == 'imageupload') {
      new ImageUpload(field.options).render(dom.find('div[data-imageupload-name=\'' + field.name + '\']', this.container));
    } else if (field.input == 'images') {

    } else if (field.input == 'longtext') {
      if (field.language === 'javascript') {
        let textarea = dom.find(containerId + ' textarea[name=\'' + field.name + '\']');
        let cm = CodeMirror.fromTextArea(textarea, {
          mode: 'javascript',
          lineNumbers: true,
          height: 420,
          background: '#565656'
        });
        cm.on('keyup', function(cm, what) {
          dom.find(' textarea[name=\'' + field.name + '\']', this.container).innerText = cm.getDoc().getValue();
        });
      }
    } else if (field.input == 'avatar') {
      new Avatar({
        readonly: this.readonly,
        name: field.name
      }).render(dom.find('div[data-avatar-name=\'' + field.name + '\']', this.container), field.value);
    } else if (field.input == 'logo') {
      new Logo({
        readonly: this.readonly,
        name: field.name
      }).render(dom.find('div[data-logo-name=\'' + field.name + '\']', this.container), field.value);
    }
  }

  let containerButtons = dom.create('div');
  containerButtons.classList.add('buttons');
  let buttons = dom.create('div');
	if(this.mode!='page'){
		buttons.classList.add('float-right');
	}else{
		buttons.classList.add('row-button');
	}

  // custom buttons
  for (let i = 0; i < this.actions.length; i++) {
    buttons.appendChild(this.createButton(this.actions[i]));
    buttons.append(' ');
  }

  let buttonClose = dom.create('button', 'btn', 'btn-sm', 'btn-close');
  buttonClose.textContent = '关闭';
  dom.bind(buttonClose, 'click', function() {
    event.preventDefault();
    event.stopPropagation();
    let rightbar = dom.find('div[widget-id=right-bar]')
    // let rightbar = dom.ancestor(self.container, 'div', 'right-bar');
    if (rightbar != null) {
      rightbar.children[0].classList.add('out');
      setTimeout(function () {
        rightbar.remove();
      }, 300);
    }
  });
  if (this.actionable === false) return;
  if (this.actionable && this.mode!='page') {
    buttons.appendChild(buttonClose);
  }
  let buttonSave = dom.create('button', 'btn', 'btn-sm', 'btn-save');
  buttonSave.innerHTML = this.saveText;

  dom.bind(buttonSave, 'click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    if (self.confirmText !== '') {
      let ct = self.confirmText;
      if (typeof self.confirmText === 'function') {
        ct = self.confirmText();
      }
      dialog.confirm(ct, () => {
        self.save();
      });
    } else {
      self.save();
    }
  });

  let rightBarBottom = dom.find('div[widget-id=right-bar-bottom]');
  if (rightBarBottom != null) {
    rightBarBottom.innerHTML = '';
    if (!this.readonly) {
      buttons.appendChild(buttonSave);
      buttons.append(' ');
    }
    // if (this.actions.length > 0) {
    let row = dom.create('div', 'full-width', 'b-a-0');
    let rightbar = dom.find('.right-bar');
    if (rightbar != null) {
      if (rightBarBottom.parentElement.style.display !== 'none') {
        rightBarBottom.appendChild(buttonSave);
        for (let action of self.actions) {
          rightBarBottom.appendChild(dom.element('<span style="display: inline-block;width: 10px;"></span>'));
          rightBarBottom.appendChild(self.createButton(action));
        }
        rightBarBottom.appendChild(buttonClose);
      } else {
        containerButtons.appendChild(buttons);
        row.appendChild(containerButtons);
        this.container.appendChild(row);
      }
    } else {
      // FIXME: WHY DO THIS?
      // this.container.appendChild(buttons);
    }
  }

  this.originalPosition = this.container.getBoundingClientRect();
  this.originalPositionTop = this.originalPosition.top;

  // 初始化显示
  this.onInit();
};

/**
 * Fetches form data from remote data source and renders form
 * under container.
 *
 * @param read
 *        the remote options
 */
FormLayout.prototype.fetch = async function (params) {
  let self = this;
  params = params || {};
  if (!this.readOpt) {
    this.build(params);
    return;
  }
  if (this.readOpt.params) {
    for (let k in this.readOpt.params) {
      params[k] = this.readOpt.params[k];
    }
  }
  // if not need to fetch data
  if (!this.readOpt.url && this.readOpt.url == '') {
    this.build({});
    return;
  }
  let data = await xhr.promise({
    url: this.readOpt.url,
    data: params,
  });
  if (!data) data = {};
  if (self.readOpt.asyncConvert) {
    data = await self.readOpt.asyncConvert(data);
  }
  if (self.readOpt.convert) {
    data = self.readOpt.convert(data);
  }
  if (utils.isEmpty(data)) {
    self.build(params);
    if (self.readOpt.callback) {
      self.readOpt.callback(params);
    }
  } else {
    for (let keyParam in params) {
      if (typeof data[keyParam] === 'undefined') {
        data[keyParam] = params[keyParam];
      }
    }
    self.build(data);
    if (self.readOpt.callback) {
      self.readOpt.callback(data);
    }
  }
};

FormLayout.prototype.read = function (params) {
  let self = this;
  params = params || {};

  if (this.readOpt.params) {
    for (let k in this.readOpt.params) {
      params[k] = this.readOpt.params[k];
    }
  }
  xhr.post({
    url: this.readOpt.url,
    data: params,
    success: function(resp) {
      if (resp.error) {
        dialog.error(resp.error.message);
        return;
      }
      dom.formdata(self.container, resp.data);
    }
  });
};

/**
 * Saves form data to remote data source.
 */
FormLayout.prototype.save = async function () {
  let self = this;
  let awaitConvert = this.saveOpt.awaitConvert || false;
  let errors = Validation.validate($(this.containerId));
  if (errors.length > 0) {
    self.error(utils.message(errors));
    return;
  }
  // disable all buttons
  let buttonSave = dom.find('button.btn-save', this.container);
  if (buttonSave != null)
    buttonSave.innerHTML = "<i class='fa fa-spinner fa-spin'></i>数据保存中……";
  dom.disable(dom.find('button', this.container), 'disabled', true);
  let formdata = dom.formdata(this.containerId);
  let data = this.saveOpt.params || {};
  for (let key in formdata) {
    data[key] = formdata[key];
  }
  if (this.saveOpt.convert) {
    if (awaitConvert) {
      data = await this.saveOpt.convert(data)
    } else {
      data = this.saveOpt.convert(data);
    }
  } else if (this.saveOpt.asyncConvert) {
    data = await this.saveOpt.asyncConvert(data);
  }
  xhr.post({
    url: this.saveOpt.url,
    usecase: this.saveOpt.usecase,
    data: data,
    success: function (resp) {
      // enable all buttons
      if (buttonSave != null)
        buttonSave.innerHTML = self.saveText;
      dom.enable('button', self.container);
      if (resp.error) {
        self.error(resp.error.message);
        return;
      }
      let identifiables = document.querySelectorAll(' input[data-identifiable=true]', self.container);
      for (let i = 0; i < identifiables.length; i++) {
        identifiables[i].value = resp.data[identifiables[i].name];
      }
      if (self.saveOpt.callback) self.saveOpt.callback(resp.data);
      if (self.saveOpt.success) self.saveOpt.success(resp.data);
      self.success(self.savePromptText || '数据保存成功！', () => {
        // 默认自动关闭
        if (self.saveOpt.autoClose !== false) {
          let rightbar = dom.find('div[widget-id=right-bar]');
          if (rightbar != null) {
            rightbar.children[0].classList.add('out');
            setTimeout(function () {
              rightbar.remove();
            }, 300);
          }
        }
      });
    }
  });
};

/**
 * Creates input element in form.
 *
 * @param field
 *        field option
 *
 * @param FormLayout.js
 *        column count in a row
 *
 * @returns {object} label and input with add-ons dom elements
 *
 * @private
 */
FormLayout.prototype.createInput = function (field, columnCount) {
  let self = this;
  field.columnCount = field.columnCount || 1;
  columnCount = columnCount || 2;
  let _required = field.required || false;

  let averageSpace = 24 / columnCount;
  let labelGridCount = 0;
  let inputGridCount = 0;
  if (averageSpace === 24) {
    labelGridCount = 6;
    inputGridCount = 18;
  } else if (averageSpace === 12) {
    labelGridCount = 6;
    inputGridCount = 18;
  } else if (averageSpace === 8) {
    labelGridCount = 3;
    inputGridCount = 5;
  } else if (averageSpace === 6) {
    labelGridCount = 2;
    inputGridCount = 4;
  }
  let label = dom.create('div', 'col-24-' + this.formatGridCount(labelGridCount),'col-form-label', (_required?'required':'norequired'));
  label.innerText = field.title + '：';
  inputGridCount += (labelGridCount + inputGridCount) * (field.columnCount - 1);
  let group = dom.create('div', 'col-24-' + this.formatGridCount(inputGridCount), 'input-group');

  let input = null;
  if (field.input == 'code') {
    let fixed = field.fixed || [];
    for (let i = 0; i < fixed.length; i++) {
      let prepend = dom.element(`
        <div class="input-group-prepend">
          <span class="input-group-text">
          </span>
        </div>
      `);
      prepend.querySelector('span').innerText = fixed[i];
      group.appendChild(prepend);
    }
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('name', field.name);
  } else if (field.input == 'select') {
    input = dom.create('select', 'form-control');
    input.style = '-moz-appearance:none';
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input == 'bool') {
    input = dom.element(`
      <div class="d-flex full-width">
        <label class="c-switch c-switch-label c-switch-pill c-switch-info mt-1" style="min-width: 48px;">
          <input class="c-switch-input" value="T" name="" type="checkbox">
          <span class="c-switch-slider" data-checked="是" data-unchecked="否"></span>
        </label>
        <select class="form-control ml-4">
          <option value="-1">请选择</option>
        </select>
      </div>
    `);
    let elInput = dom.find('input', input);
    // default is checked
    // dom.find('input', input).setAttribute('checked', true);
    if (field.value === 'T' || field.value === true) {
      dom.find('input', input).setAttribute('checked', false);
    }
    if (field.disabled === true) {
      elInput.disabled = true;
    }
    let select = dom.find('select', input);

    if (!field.options) {
      select.remove();
    } else {
      select.name = field.name + '$';
      for (let j = 0; j < field.options.values.length; j++) {
        let value = field.options.values[j];
        select.appendChild(dom.element('<option value="' + value.value + '" ' + (field.value === value.value ? 'selected' : '') + '>' + value.text + '</option>'));
      }
      if (!field.value || field.value === 'F') {
        elInput.checked = false;
        select.disabled = true;
      } else {
        elInput.checked = true;
      }
      elInput.addEventListener('change', ev => {
        let select = dom.find('select', ev.target.parentElement.parentElement);
        if (ev.target.checked)
          select.disabled = false;
        else
          select.disabled = true;
      });
    }
    dom.find('input', input).setAttribute('name', field.name);
  } else if (field.input == 'radiotext' || field.input == 'booltext') {
    let radios = [];
    let defaultValue = '';
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      if (!val.input) {
        defaultValue = val.value;
        break;
      }
    }
    let checked = false;
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      let radio = dom.element(`
        <div class="form-check form-check-inline">
          <input name="" value="" type="radio"
                 class="form-check-input radio color-primary is-outline">
          <label class="form-check-label" for=""></label>
        </div>
      `);
      dom.find('input', radio).name = field.name;
      if (!field.value) {
        if (val.checked) {
          dom.find('input', radio).checked = true;
        }
      } else {
        if (field.value != val.value && val.value != defaultValue && !checked) {
          // 自定义的输入框的值
          dom.find('input', radio).checked = true;
        } else if (field.value == val.value) {
          // 初始的默认值
          dom.find('input', radio).checked = true;
          checked = true;
        }
      }
      dom.find('input', radio).value = val.value;
      dom.find('input', radio).disabled = this.readonly || field.readonly || false;
      // dom.find('label', radio).setAttribute('for', 'radio_' + val.value);
      dom.find('label', radio).textContent = val.text;
      group.append(radio);
      radios.push(radio);
    }
    for (let j = 0; j < field.values.length; j++) {
      let val = field.values[j];
      // 有输入框
      if (val.input) {
        dom.bind(radios[j], 'click', (ev) => {
          let textInput = dom.find('input[type=text]', group);
          textInput.style.display = '';
        });
        let input = dom.element('<input type="text" class="form-control">');
        input.name = val.input.name;
        input.placeholder = val.input.placeholder || '';
        input.style.display = field.value && field.value != defaultValue ? '' : 'none';
        if (val.value != field.value) {
          input.value = field.value;
          if (input.value == defaultValue) {
            input.value = '';
          }
        }
        group.appendChild(input);
      } else {
        dom.bind(radios[j], 'click', (ev) => {
          let textInput = dom.find('input[type=text]', group);
          textInput.style.display = 'none';
        });
      }
    }
  } else if (field.input == 'radio') {
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      let radio = dom.element(`
        <div class="form-check form-check-inline">
          <input name="" value="" type="radio"
                 class="form-check-input radio color-primary is-outline">
          <label class="form-check-label" for=""></label>
        </div>
      `);
      // dom.find('input', radio).id = 'radio_' + val.value;
      dom.find('input', radio).name = field.name;
      if (field.value == val.value) {
        dom.find('input', radio).checked = true;
      } else if (val.checked && !field.value) {
        dom.find('input', radio).checked = true;
      }
      dom.find('input', radio).value = val.value;
      dom.find('input', radio).disabled = this.readonly || field.readonly || false;
      // dom.find('label', radio).setAttribute('for', 'radio_' + val.value);
      dom.find('label', radio).textContent = val.text;
      group.append(radio);
    }
  } else if (field.input == 'longtext') {
    input = dom.create('textarea', 'form-control');
    field.style = field.style || '';
    input.style = field.style;
    // if (this.readonly)
    //   input.style.backgroundColor = 'rgb(240, 243, 245)';
    if (field.style === '')
      input.rows = 4;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入...');
    input.innerHTML = field.value || '';
    if (this.readonly)
      input.setAttribute('disabled', true);
  } else if (field.input == 'selecttext') {
    let div = dom.create('div', 'full-width', 'position-relative');
    div.style.height = '120px';
    div.style.overflow = 'hidden';
    input = dom.create('textarea', 'form-control', 'full-width');
    field.style = field.style || '';
    input.style = field.style;
    input.style.height = '120px';
    input.style.resize = 'none';

    let corner = dom.create('div');
    corner.style.position = 'absolute';
    corner.style.bottom = '0';
    corner.style.right = '0';
    corner.style.background = 'transparent';
    corner.style.borderWidth = '0px 0px 48px 48px';
    corner.style.borderStyle = 'solid';
    corner.style.borderColor = 'transparent transparent rgba(0, 0, 0, 0.3)';
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入...');
    input.innerHTML = field.value || '';

    div.appendChild(input);
    div.appendChild(corner);

    let select = dom.create('a', 'btn-link', 'font-11', 'text-light');
    select.innerText = '选择';
    select.style.position = 'absolute';
    select.style.bottom = '-2px';
    select.style.right = '-2px';
    dom.bind(select, 'click', ev => {
      if (field.onSelect) {
        field.onSelect(input);
      }
    });
    if (this.readonly)
      input.setAttribute('disabled', true);
    else
      div.appendChild(select);

    group.appendChild(div);
    return {label: label, input: group};
  } else if (field.input == 'cascade') {
    input = dom.create('div', 'form-control');
    if (this.readonly)
      input.style.backgroundColor = 'rgb(240, 243, 245)';
    input.setAttribute('data-cascade-name', field.name);
  } else if (field.input == 'checktree') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-checktree-name', field.name);
    input.setAttribute('id', 'checktree_' + field.name);
  } else if (field.input == 'checklist') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-checklist-name', field.name);
  } else if (field.input == 'fileupload') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-fileupload-name', field.name);
  } else if (field.input == 'imageupload') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-imageupload-name', field.name);
  } else if (field.input == 'avatar') {
    input = dom.create('div', 'full-width','avatar-img');
    input.setAttribute('data-avatar-name', field.name);
    // group.classList.remove('col-md-4', 'col-md-9');
    group.classList.add('col-24-24');
    group.appendChild(input);
    return {label: null, input: group};
  } else if (field.input == 'logo') {
    input = dom.create('div', 'full-width');
    input.setAttribute('data-logo-name', field.name);
    // sgroup.classList.remove('col-md-4', 'col-md-9');
    group.classList.add('col-24-24');
    group.appendChild(input);
    return {label: null, input: group};
  } else if (field.input == 'datetime') {
    let dateIcon = dom.element(`
      <div class="input-group-prepend">
        <span class="input-group-text">
          <i class="far fa-calendar-alt"></i>
        </span>
      </div>
    `);
    let dateInput = dom.create('input', 'form-control');
    dateInput.disabled = this.readonly || field.readonly || false;
    dateInput.setAttribute('name', field.name + '_date');
    dateInput.setAttribute('placeholder', '请选择...');
    dateInput.setAttribute('autocomplete', 'off');
    let timeIcon = dom.element(`
      <div class="input-group-prepend">
        <span class="input-group-text">
          <i class="far fa-clock"></i>
        </span>
      </div>
    `);
    let timeInput = dom.create('input', 'form-control');
    timeInput.disabled = this.readonly || field.readonly || false;
    timeInput.setAttribute('name', field.name + '_time');
    timeInput.setAttribute('autocomplete', 'off');
    group.appendChild(dateIcon);
    group.appendChild(dateInput);
    group.appendChild(timeIcon);
    group.appendChild(timeInput);
    return {label: label, input: group};
  } else if (field.input == 'tags') {
    input = dom.create('input', 'form-control');
    input.name = field.name;
    input.disabled = this.readonly || field.readonly || false;
  } else if (field.input == 'custom') {
    input = dom.create('input', 'form-control');
    input.name = field.name;
    input.disabled = true;
  } else {
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入...');
    input.setAttribute('autocomplete', 'off');
    if (field.value) {
      input.value = field.value;
    }
  }
  if (input != null) {
    group.appendChild(input);
  }

  // 有了父节点以后的后续处理
  if (field.domain) {
    input.setAttribute('data-domain-type', field.domain);
  }
  if (field.input == 'tags') {
    input.setAttribute('placeholder', '请输入');
    new Tagify(input);
  } else if (field.input == 'date') {
    input.setAttribute('data-domain-type', 'date');
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input.indexOf('number') == 0) {
    input.setAttribute('data-domain-type', field.input);
    input.setAttribute('placeholder', '请输入...');
  } else if (field.input == 'file') {
    input.setAttribute('readonly', true);
    let fileinput = dom.create('input');
    fileinput.setAttribute('type', 'file');
    fileinput.style.display = 'none';
    let upload = dom.element('<span class="input-group-text pointer"><i class="fas fa-upload text-primary"></i></span>');
    upload.addEventListener('click', function() {
      fileinput.click();
    });
    fileinput.addEventListener('change', function(event) {
      event.preventDefault();
      event.stopPropagation();
      input.value = fileinput.files[0].name;
      let idx = input.value.lastIndexOf('.');
      let ext = '';
      if (idx != -1) {
        ext = input.value.substring(input.value.lastIndexOf('.') + 1);
      }
      xhr.upload({
        url: '/api/v3/common/upload',
        params: field.params,
        file: fileinput.files[0],
        success: function(resp) {
          let item = resp.data;
          input.setAttribute('data-file-type', fileinput.files[0].type);
          input.setAttribute('data-file-size', fileinput.files[0].size);
          input.setAttribute('data-file-path', item.filepath);
          input.setAttribute('data-file-ext', ext);
        }
      });
      FormLayout.validate(input);
    });
    group.appendChild(fileinput);
    if (!this.readonly) {
      group.appendChild(upload);
    }
  }

  if (field.create) {
    let addnew = dom.element(`
      <div class="input-group-append">
        <span class="input-group-text">
          <i class="fas fa-plus-square pointer text-success"></i>
        </span>
      </div>
    `);

    if (field.input == 'custom' || field.input == 'select') {
      let name = field.name;
      let custom = dom.element(`
        <div widget-id="widgetCustom_${name}" class="full-width"></div>
      `);
      field.create(addnew, custom, field);
      if (field.readonly !== true) {
        group.appendChild(addnew);
      }
      group.appendChild(custom);
    } else {
      group.appendChild(addnew);
    }
  }

  let unit = dom.element(`
    <div class="input-group-append">
      <span class="input-group-text"></span>
    </div>
  `);
  if (field.unit) {
    dom.find('span', unit).innerHTML = field.unit;
    group.appendChild(unit);
  }

  let tooltip = dom.element(`
    <div class="input-group-append">
      <span class="input-group-text width-36 icon-error"></span>
    </div>
  `);
  if (field.required && input != null /* radio, check cause input is null*/) {
    input.setAttribute('data-required', field.title);
    // dom.find('span', tooltip).innerHTML = ICON_REQUIRED;
  } else {
    // dom.find('span', tooltip).innerHTML = ICON_GENERAL;
  }
  if (field.tooltip) {
    tooltip.classList.add('pointer');
    let popup = dom.element(
      '<div class="popup hidden">' +
      '  <div class="popup-arrow"></div>' +
      '  <div class="popup-body">' + field.tooltip + '</div>' +
      '</div>');
    tooltip.appendChild(popup);
    dom.bind(tooltip, 'click', function() {
      let ox = this.offsetLeft;
      let oy = this.offsetTop;
      let height = parseInt(this.clientHeight);
      let popup = dom.find('div.popup', this);

      popup.style.right = '0';
      popup.style.top = oy - (height / 2) + 'px';

      popup.classList.remove('hidden');
      popup.classList.add('show');

      setTimeout(function(event) {
        popup.classList.remove('show');
        popup.classList.add('hidden');
      }, 2000);
    });
  }
  if (!this.readonly &&
    field.input !== 'bool' &&
    field.input !== 'radio' &&
    field.input !== 'checklist' &&
    field.input !== 'longtext' &&
    field.input !== 'checktree' &&
    field.input !== 'fileupload' &&
    field.input !== 'imageupload')
    group.append(tooltip);

  // user input
  if (input != null) {
    dom.bind(input, 'input', function (event) {
      if (field.onInput) {
        field.onInput(event);
      }
      FormLayout.validate(this);
    });
  }

  // set value programmatically
  if (field.input == 'date' || field.input == 'text' || field.input.indexOf('number') == 0 || field.input == 'file') {
    const {get, set} = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    Object.defineProperty(input, 'value', {
      get() {
        return get.call(this);
      },
      set(newVal) {
        set.call(this, newVal);
        FormLayout.validate(this);
        return newVal;
      }
    });
    input.value = field.value;
  }
  if (field.input == 'select') {
    const {get, set} = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
    Object.defineProperty(input, 'selectedIndex', {
      get() {
        return get.call(this);
      },
      set(newVal) {
        set.call(this, newVal);
        FormLayout.validate(this);
        return newVal;
      }
    });
    input.value = field.value;
  }

  if (field.input.indexOf('number') == 0) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
      input.addEventListener(event, function (event) {
        let domainType = this.getAttribute('data-domain-type');
        let validation = Validation.getDomainValidator(new ValidationModel(domainType));
        // /^-?\d*$/.test(this.value)
        if (validation.test(this.value) != REQUIRED_ERROR) {
          this.oldValue = this.value;
          this.oldSelectionStart = this.selectionStart;
          this.oldSelectionEnd = this.selectionEnd;
        } else if (this.hasOwnProperty("oldValue")) {
          this.value = this.oldValue;
          this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
        } else {
          this.value = "";
        }
        FormLayout.validate(this);
      });
    });
  }

  return {label: label, input: group};
};

/**
 * Creates button element.
 *
 * @param action
 *        action option
 *
 * @returns {button} the button dom element
 *
 * @private
 */
FormLayout.prototype.createButton = function(action) {
  let button = dom.create('button', 'btn', 'btn-sm');
  if (action.classes) {
    for (let i = 0; i < action.classes.length; i++) {
      button.classList.add(action.classes[i]);
    }
  }
  button.innerHTML = action.text;
  if (action.onClicked) {
    button.onclick = (ev) => {
      if (action.confirmText) {
        dialog.confirm(action.confirmText, () => {
          action.onClicked(dom.formdata(this.container));
        });
      } else {
        action.onClicked(dom.formdata(this.container));
      }
    };
  }
  return button;
};

FormLayout.prototype.error = function (message) {
  message = message || '出现系统错误！';
  message = message.replaceAll('\n', '<br>');
  this.toast.style.zIndex = 11000;
  this.toast.classList.remove('bg-success', 'hidden');
  this.toast.classList.add('bg-danger');
  let posInScreen = this.container.getBoundingClientRect();
  let offsetTop = posInScreen.top - this.originalPositionTop;

  this.toast.style.top = (-offsetTop + 10) + 'px';
  dom.find('.toast-body', this.toast).innerHTML = message;
  dom.find('strong', this.toast).innerText = '错误';
  this.toast.classList.add('show', 'in');
};

FormLayout.prototype.success = function (message, callback) {
  let self = this;
  this.toast.style.zIndex = 11000;
  this.toast.classList.remove('bg-danger', 'hidden');
  // this.toast.classList.add('bg-success');
  this.toast.style.backgroundColor = 'var(--color-success)'

  let posInScreen = this.container.getBoundingClientRect();
  let offsetTop = posInScreen.top - this.originalPositionTop;

  this.toast.style.top = (-offsetTop + 10) + 'px';
  dom.find('.toast-body', this.toast).innerHTML = message;
  dom.find('strong', this.toast).innerText = '成功';
  this.toast.classList.add('show', 'in');
  setTimeout(function() {
    dom.find('button', self.toast).click();
    if (callback) callback();
  }, 1000);
};

FormLayout.prototype.hideSidebar = function (message, callback) {
  let rightbar = dom.find('div[widget-id=right-bar]')
  // let rightbar = dom.ancestor(self.container, 'div', 'right-bar');
  if (rightbar != null) {
    rightbar.children[0].classList.add('out');
    setTimeout(function () {
      rightbar.remove();
    }, 300);
  }
};

/**
 * Validates an input in a form.
 *
 * @param input
 *        the dom element for user input
 */
FormLayout.validate = function(input) {
  if (input.tagName == 'OPTION')
    input = input.parentElement;
  if (input == null) return;

  let span = dom.find('div span.icon-error', input.parentElement);
  if (span == null) return; // readonly
  let dataRequired = input.getAttribute('data-required');
  let required =  dataRequired != null && dataRequired !== '';
  if (input.tagName == 'SELECT') {
    if (input.selectedIndex == -1) {
      if (required)
        span.innerHTML = ICON_REQUIRED;
      else
        span.innerHTML = ICON_GENERAL;
    } else {
      span.innerHTML = ICON_CORRECT;
    }
    return;
  } else if (input.tagName == 'DIV') {
    // cascade
    let links = input.querySelectorAll('a[data-cascade-name]');
    let values = [];
    for (let i = 0; i < links.length; i++) {
      let link = links[i];
      let value = link.getAttribute('data-cascade-value');
      if (value != null && value != '-1' && value != '') {
        values.push(value);
      }
    }
    if (values.length == links.length) {
      span.innerHTML = ICON_CORRECT;
    } else if (values.length == 0) {
      if (required)
        span.innerHTML = ICON_REQUIRED;
      else
        span.innerHTML = ICON_GENERAL;
    } else {
      span.innerHTML = ICON_ERROR;
    }
    return;
  }

  if (input.value.trim() == '') {
    if (required)
      span.innerHTML = ICON_REQUIRED;
    else
      span.innerHTML = ICON_GENERAL;
    return;
  }

  let domainType = input.getAttribute('data-domain-type');
  if (domainType != null && domainType != '') {
    let validation = Validation.getDomainValidator(new ValidationModel(domainType));
    let res = validation.test(input.value);
    if (res == NO_ERRORS) {
      span.innerHTML = ICON_CORRECT;
    } else if (res == FORMAT_ERROR) {
      span.innerHTML = ICON_ERROR;
    }
  } else {
    span.innerHTML = ICON_CORRECT;
  }
};

FormLayout.prototype.setInputValue = function (name, value) {
  let foundField = null;
  for (let field of this.fields) {
    if (field.name === name) {
      foundField = field;
      break;
    }
  }
  if (foundField == null) return;
  if (foundField.input === 'bool') {
    let elInput = dom.find(`input[name=${name}]`, this.container);
    if (value === 'T' && !elInput.checked) {
      elInput.click();
      return;
    }
    if (value === 'F' && elInput.checked) {
      elInput.click();
      return;
    }
  }
};

FormLayout.prototype.getInputValue = function (name) {
  let foundField = null;
  for (let field of this.fields) {
    if (field.name === name) {
      foundField = field;
      break;
    }
  }
  if (foundField == null) return null;
  if (foundField.input === 'bool') {
    let elInput = dom.find(`input[name=${name}]`, this.container);
    return elInput.checked ? 'T' : 'F';
  }
  return null;
};

FormLayout.prototype.input = function(nameAndValue) {
  let name = nameAndValue.name;
  let value = nameAndValue.value;
  let text = nameAndValue.text;
  let control = this.controls[name];
  if (!control) return;
  let newOption = new Option(text, value, false, true);
  control.append(newOption).trigger('change');
};

FormLayout.prototype.formatGridCount = function(count) {
  if (count < 10) {
    return '0' + count;
  }
  return '' + count;
};

FormLayout.prototype.setVariables = function(vars){
  for (let key in vars) {
    if (this.variableListeners[key]) {
      this.variableListeners[key](vars[key]);
    }
  }
};

/**
 * 通过字段值判断其他字段显示与否。
 */
// FormLayout.prototype.controlFields = function() {
//   console.log('hello');
//   let data = dom.formdata(this.container);
//   for (let field of this.fields) {
//     if (field.visible) {
//       let input = this.container.querySelector('[name="' + field.name + '"]');
//       if (input != null)
//         field.visible(data, input.parentElement.parentElement);
//     }
//   }
// };