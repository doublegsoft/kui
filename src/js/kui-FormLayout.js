if (typeof layout === 'undefined') layout = {};

let ICON_REQUIRED = '<i class="fas fa-asterisk icon-required"></i>';
let ICON_CORRECT = '<i class="fas fa-check text-success" style="width: 10px;"></i>';
let ICON_ERROR = '<i class="fas fa-exclamation text-warning" style="width: 10px;"></i>';

layout.form = function(containerId, opts) {

  let container = document.querySelector(containerId);
  let fields = opts.fields;
  let actions = opts.actions || [];

  let read = opts.read || {};
  let save = opts.save || {};

  let form = dom.create('div', 'col-md-12', 'form-horizontal');
  let columnCount = opts.columnCount || 2;
  let hiddenFields = [];
  let shownFields = [];

  for (let i = 0; i < fields.length; i++) {
    let field = fields[i];
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

  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    let formGroup = dom.create('div', 'form-group', 'row');
    let group = layout.form.createInput(row.first, columnCount);

    formGroup.appendChild(group.label);
    formGroup.appendChild(group.input);

    if (columnCount == 2 && row.second) {
      group = layout.form.createInput(row.second);
      formGroup.appendChild(group.label);
      formGroup.appendChild(group.input);
    }

    form.appendChild(formGroup);
  }

  container.appendChild(form);

  // 引用的第三方插件，重新渲染
  for (let i = 0; i < fields.length; i++) {
    let field = fields[i];
    if (field.input == 'date') {
      $(containerId + ' input[name=' + field.name + ']').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'zh_CN'
      });
    } else if (field.input == 'select') {
      let opts = field.options;
      opts.validate = layout.form.validate;
      $(containerId + ' select[name=' + field.name + ']').searchselect(opts);
    } else if (field.input == 'cascade') {
      let opts = field.options;
      opts.validate = layout.form.validate;
      $(containerId + ' div[name=' + field.name + ']').cascadeselect(opts);
    }
  }

  let buttons = dom.create('div', 'float-right', 'form-buttons');
  for (let i = 0; i < actions.length; i++) {
    buttons.appendChild(layout.form.createButton(actions[i]));
    if (i != actions.length - 1) buttons.append(' ');
  }
  let row = dom.create('div', 'row');
  let col = dom.create('div', 'col-md-12');
  col.appendChild(buttons);
  row.appendChild(col);
  form.appendChild(row);
};

layout.form.render = function (data) {

};

layout.form.fetch = function (read) {
  xhr.post({
    url: read.url,
    usecase: read.usecase,
    data: read.data,
    success: function(resp) {
      if (resp.error) {
        dialog.error(resp.error.message);
        return;
      }
      layout.form.render(data);
    }
  });
};

layout.form.save = function (containerId, save) {
  let errors = Validation.validate(containerId);
  if (errors.length > 0) {
    dialog.error(utils.message(errors));
    return;
  }
  let formdata = $('#' + containerId).formdata();
  xhr.post({
    url: this.save.url,
    usecase: this.save.usecase,
    data: formdata,
    success: function(resp) {
      if (resp.error) {
        dialog.error(resp.error.message);
        return;
      }
      layout.form.render(data);
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
layout.form.createInput = function (field, columnCount) {
  columnCount = columnCount || 2;
  let label = dom.create('div', columnCount == 2 ? 'col-md-2' : 'col-md-3', 'col-form-label');
  label.innerText = field.title + '：';
  let group = dom.create('div', columnCount == 2 ? 'col-md-4' : 'col-md-9', 'input-group');

  let input = null;
  if (field.input == 'select') {
    input = dom.create('select', 'form-control');
  } else if (field.input == 'cascade') {
    input = dom.create('div', 'form-control');
  } else {
    input = dom.create('input', 'form-control');
  }

  input.setAttribute('name', field.name);
  group.appendChild(input);

  if (field.input == 'date') {
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
      layout.form.validate(input);
    });
    group.appendChild(fileinput);
    group.appendChild(upload);
  }

  if (field.required) {
    input.setAttribute('data-required', field.title);
    group.append(dom.element('<div class="input-group-append"><span class="input-group-text icon-error"><i class="fas fa-asterisk icon-required"></i></span></div>'));

    // user input
    dom.bind(input, 'input', function(event) {
      layout.form.validate(this);
    });

    // set value programmatically
    if (field.input == 'date' || field.input == 'text') {
      const {get, set} = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      Object.defineProperty(input, 'value', {
        get() {
          return get.call(this);
        },
        set(newVal) {
          set.call(this, newVal);
          layout.form.validate(this);
          return newVal;
        }
      });
    }
    if (field.input == 'select') {
      const {get, set} = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
      Object.defineProperty(input, 'selectedIndex', {
        get() {
          return get.call(this);
        },
        set(newVal) {
          set.call(this, newVal);
          layout.form.validate(this);
          return newVal;
        }
      });
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
          layout.form.validate(this);
        });
      });
    }
  }

  if (field.tooltip) {

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
layout.form.createButton = function(action) {
  let button = dom.create('button', 'btn', 'btn-sm', 'btn-' + action.role);
  button.innerText = action.text;
  if (action.click) button.addEventListener('click', action.click);
  return button;
}

/**
 * Validates an input in a form.
 *
 * @param input
 *        the dom element for user input
 */
layout.form.validate = function(input) {
  if (input.tagName == 'OPTION')
    input = input.parentElement;
  if (input == null) return;

  let span = dom.find('div span.icon-error', input.parentElement);

  if (input.tagName == 'SELECT') {
    if (input.selectedIndex == -1) {
      span.innerHTML = ICON_REQUIRED;
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
      span.innerHTML = ICON_REQUIRED;
    } else {
      span.innerHTML = ICON_ERROR;
    }
    return;
  }

  if (input.value.trim() == '') {
    span.innerHTML = ICON_REQUIRED;
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