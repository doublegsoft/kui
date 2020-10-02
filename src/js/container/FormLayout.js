let ICON_REQUIRED = '<i class="fas fa-asterisk icon-required"></i>';
let ICON_GENERAL = '<i class="fas fa-question icon-general"></i>';
let ICON_CORRECT = '<i class="fas fa-check text-success" style="width: 10px;"></i>';
let ICON_ERROR = '<i class="fas fa-exclamation text-warning" style="width: 10px;"></i>';

function FormLayout(opts) {
  let self = this;
  this.fields = opts.fields;
  this.readonly = opts.readonly || false;
  this.actions = opts.actions || [];
  this.columnCount = opts.columnCount || 2;
  this.saveOpt = opts.save;
  this.readOpt = opts.read;
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

  dom.find('button', this.toast).addEventListener('click', function() {
    self.toast.classList.remove('show', 'in');
    self.toast.style.zIndex = -1;
  });
}

FormLayout.prototype.render = function (containerId, read, persisted) {
  let self = this;
  this.containerId = containerId;
  if (read) {
    this.fetch(read);
    return;
  }

  persisted = persisted || {};

  this.container = document.querySelector(this.containerId);
  let form = dom.create('div', 'col-md-12', 'form-horizontal');
  form.style.marginBottom = '4rem';
  let columnCount = this.columnCount;
  let hiddenFields = [];
  let shownFields = [];

  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    // default value should be working
    if (!field.value)
      field.value = (typeof persisted[field.name] === 'undefined') ? null : persisted[field.name];
    if (field.input == 'hidden') {
      hiddenFields.push(field);
    } else {
      shownFields.push(field);
    }
  }

  let rows = [];
  let len = shownFields.length;
  for (let i = 0; i < shownFields.length; i++) {
    let field = shownFields[i];
    rows.push({
      first: field,
      second: (i + 1 < len) ? shownFields[i + 1] : null
    });
    if (columnCount == 2)
      i += 1;
  }

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

  // shown fields
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    let formGroup = dom.create('div', 'form-group', 'row');
    let group = this.createInput(row.first, columnCount);

    formGroup.appendChild(group.label);
    formGroup.appendChild(group.input);

    if (columnCount == 2 && row.second) {
      group = this.createInput(row.second);
      formGroup.appendChild(group.label);
      formGroup.appendChild(group.input);
    }
    form.appendChild(formGroup);
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
      $(containerId + ' input[name=\'' + field.name + '\']').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'zh_CN'
      });
      // 加载值或者默认值
      if (field.value != null) {
        $(containerId + ' input[name=\'' + field.name + '\']').val(
          moment(field.value).format('YYYY-MM-DD'));
      }
    } else if (field.input == 'select') {
      let opts = field.options;
      opts.validate = FormLayout.validate;
      // 加载值或者默认值
      opts.selection = field.value;
      $(containerId + ' select[name=\'' + field.name + '\']').searchselect(opts);
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
      $(containerId + ' div[data-cascade-name=\'' + field.name + '\']').cascadeselect(opts);
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
      new TreelikeList(field.options).render(dom.find('div[data-checktree-name=\'' + field.name + '\']', this.container));
    } else if (field.input == 'fileupload') {
      new FileUpload(field.options).render(dom.find('div[data-fileupload-name=\'' + field.name + '\']', this.container));
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
          dom.find(containerId + ' textarea[name=\'' + field.name + '\']').innerText = cm.getDoc().getValue();
        });
      }
    }
  }

  let buttons = dom.create('div', 'float-right', 'form-buttons');
  let buttonSave = dom.create('button', 'btn', 'btn-sm', 'btn-save');
  buttonSave.textContent = '保存';
  dom.bind(buttonSave, 'click', function() {
    self.save();
  });
  buttons.appendChild(buttonSave);
  buttons.append(' ');

  // custom buttons
  for (let i = 0; i < this.actions.length; i++) {
    buttons.appendChild(this.createButton(this.actions[i]));
    buttons.append(' ');
  }

  let buttonClose = dom.create('button', 'btn', 'btn-sm', 'btn-close');
  buttonClose.textContent = '关闭';
  dom.bind(buttonClose, 'click', function() {
    let rightbar = dom.find('.rightbar');
    if (rightbar != null)
      rightbar.classList.add('out');
    setTimeout(function() {
      rightbar.remove();
    }, 1000);
  });
  buttons.appendChild(buttonClose);
  // if (this.actions.length > 0) {
  let row = dom.create('div', 'full-width');
  row.style.backgroundColor = '#f0f3f5';
  row.style.paddingTop = '5px';
  row.style.borderTop = '1px solid #c8ced3';
  row.style.borderBottom = '1px solid #c8ced3';
  row.style.paddingRight = '20px';
  row.style.marginLeft = '-20px';
  row.style.position = 'fixed';
  row.style.zIndex = '2001';
  let rightbar = dom.find('.rightbar');
  if (rightbar != null) {
    row.style.top = (rightbar.clientHeight - 56 - 14) + 'px';
    row.appendChild(buttons);
    this.container.appendChild(row);
  }

  this.originalPosition = this.container.getBoundingClientRect();
  this.originalPositionTop = this.originalPosition.top;

};

/**
 * Fetches form data from remote data source and renders form
 * under container.
 *
 * @param read
 *        the remote options
 */
FormLayout.prototype.fetch = function (params) {
  let self = this;
  if (!this.readOpt) {
    this.render(this.containerId);
    return;
  }
  xhr.post({
    url: this.readOpt.url,
    usecase: this.readOpt.usecase,
    data: params,
    success: function(resp) {
      if (resp.error) {
        dialog.error(resp.error.message);
        return;
      }
      self.render(self.containerId, null, resp.data);
    }
  });
  this.params = params;
};

/**
 * Saves form data to remote data source.
 */
FormLayout.prototype.save = function () {
  let self = this;
  let errors = Validation.validate($(this.containerId));
  if (errors.length > 0) {
    self.error(utils.message(errors));
    return;
  }
  // disable all buttons
  dom.find(this.containerId + ' button.btn-save').innerHTML = "<i class='fa fa-spinner fa-spin'></i>数据保存中……";
  dom.disable(this.containerId + ' button', 'disabled', true);
  let formdata = dom.formdata(this.containerId);
  let data = this.saveOpt.data || {};
  for (let key in formdata) {
    data[key] = formdata[key];
  }
  xhr.post({
    url: this.saveOpt.url,
    usecase: this.saveOpt.usecase,
    data: data,
    success: function(resp) {
      // enable all buttons
      dom.find(self.containerId + ' button.btn-save').innerHTML = '保存';
      dom.enable(self.containerId + ' button');
      if (resp.error) {
        self.error(resp.error.message);
        // dialog.error(resp.error.message);
        return;
      }
      let identifiables = document.querySelectorAll(self.containerId + ' input[data-identifiable=true]');
      for (let i = 0; i < identifiables.length; i++) {
        identifiables[i].value = resp.data[identifiables[i].name];
      }
      if (self.saveOpt.callback) self.saveOpt.callback(resp.data);
      self.success("数据保存成功！");
    }
  });
};

/**
 * Creates input element in form.
 *
 * @param field
 *        field option
 *
 * @param columnCount
 *        column count in a row
 *
 * @returns {object} label and input with add-ons dom elements
 *
 * @private
 */
FormLayout.prototype.createInput = function (field, columnCount) {
  let self = this;
  columnCount = columnCount || 2;
  let label = dom.create('div', columnCount == 2 ? 'col-md-2' : 'col-md-3', 'col-form-label');
  label.innerText = field.title + '：';
  let group = dom.create('div', columnCount == 2 ? 'col-md-4' : 'col-md-9', 'input-group');

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
    input.setAttribute('name', field.name);
  } else if (field.input == 'select') {
    input = dom.create('select', 'form-control');
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('name', field.name);
  } else if (field.input == 'bool') {
    input = dom.element(`
      <label class="c-switch c-switch-label c-switch-pill c-switch-info mt-1">
        <input class="c-switch-input" value="T" name="" type="checkbox">
        <span class="c-switch-slider" data-checked="是" data-unchecked="否"></span>
      </label>
    `);
    if (field.value == true || field.value == 'true' || field.value == 'T') {
      dom.find('input', input).checked = true;
    }
    dom.find('input', input).setAttribute('name', field.name);
  } else if (field.input == 'radio') {
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      let radio = dom.element(`
        <div class="form-check form-check-inline">
          <input id="" name="" value="" type="radio"
                 class="form-check-input radio color-primary is-outline">
          <label class="form-check-label" for=""></label>
        </div>
      `);
      dom.find('input', radio).id = 'radio_' + val.value;
      dom.find('input', radio).name = field.name;
      dom.find('input', radio).checked = field.value == val.value;
      dom.find('input', radio).value = val.value;
      dom.find('input', radio).disabled = this.readonly || field.readonly || false;
      dom.find('label', radio).setAttribute('for', 'radio_' + val.value);
      dom.find('label', radio).textContent = val.text;
      group.append(radio);
    }
  } else if (field.input == 'longtext') {
    input = dom.create('textarea', 'form-control');
    if (this.readonly)
      input.style.backgroundColor = 'rgb(240, 243, 245)';
    input.rows = 4;
    input.setAttribute('name', field.name);
    input.innerHTML = field.value || '';
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
  } else {
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly || field.readonly || false;
    input.setAttribute('name', field.name);
  }
  if (input != null) {
    group.appendChild(input);
  }

  if (field.domain) {
    input.setAttribute('data-domain-type', field.domain);
  } else if (field.input == 'date') {
    input.setAttribute('data-domain-type', 'date');
  } else if (field.input.indexOf('number') == 0) {
    input.setAttribute('data-domain-type', field.input);
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
      input.value = fileinput.files[0].name;
      FormLayout.validate(input);
    });
    group.appendChild(fileinput);
    if (!this.readonly) {
      group.appendChild(upload);
    }
  }

  let tooltip = dom.element('<div class="input-group-append"><span class="input-group-text width-36 icon-error"></span></div>');
  if (field.required && input != null /* radio, check cause input is null*/) {
    input.setAttribute('data-required', field.title);
    dom.find('span', tooltip).innerHTML = ICON_REQUIRED;
  } else {
    dom.find('span', tooltip).innerHTML = ICON_GENERAL;
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
    field.input !== 'fileupload')
    group.append(tooltip);

  // user input
  if (input != null) {
    dom.bind(input, 'input', function (event) {
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
  if (action.click) {
    button.addEventListener('click', action.click);
  }
  return button;
};

FormLayout.prototype.error = function (message) {
  message = message.replaceAll('\n', '<br>');
  this.toast.style.zIndex = 11000;
  this.toast.classList.remove('bg-success', 'hidden');
  this.toast.classList.add('bg-danger');
  dom.find('.toast-body', this.toast).innerHTML = message;
  dom.find('strong', this.toast).innerText = '错误';
  this.toast.classList.add('show', 'in');
};

FormLayout.prototype.success = function (message) {
  let self = this;
  this.toast.style.zIndex = 11000;
  this.toast.classList.remove('bg-danger', 'hidden');
  this.toast.classList.add('bg-success');

  let posInScreen = this.container.getBoundingClientRect();
  let offsetTop = posInScreen.top - this.originalPositionTop;

  this.toast.style.top = (-offsetTop + 10) + 'px';
  dom.find('.toast-body', this.toast).innerHTML = message;
  dom.find('strong', this.toast).innerText = '成功';
  this.toast.classList.add('show', 'in');
  setTimeout(function() {
    dom.find('button', self.toast).click();
  }, 2000);
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