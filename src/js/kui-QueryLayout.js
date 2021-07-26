let ICON_CLEAR = '<i class="fas fa-backspace text-danger position-relative" style="left: -4px;"></i>';

function QueryLayout(opts) {
  let self = this;
  this.fields = opts.fields;
  this.actions = opts.actions || [];
  this.queryOpt = opts.query || {};
}

QueryLayout.prototype.render = function (containerId, read, data) {
  let self = this;
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }

  if (read) {
    this.fetch(read);
    return;
  }

  data = data || {};

  let form = dom.create('div', 'card-body');
  let columnCount = this.columnCount;
  let hiddenFields = [];
  let shownFields = [];

  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    field.value = (typeof data[field.name] === 'undefined') ? null : data[field.name];
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
    let group = this.createInput(row.first, columnCount);

    formGroup.appendChild(group.label);
    formGroup.appendChild(group.input);

    form.appendChild(formGroup);
  }
  // 必须放在这里，否者后续容器会找不到
  this.container.appendChild(form);

  // ###################### //
  // 引用的第三方插件，重新渲染 //
  // ###################### //
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    if (field.input == 'date') {
      $(this.container).find('input[name=' + field.name + ']').datetimepicker({
        format: 'YYYY-MM-DD',
        locale: 'zh_CN'
      });
      // 加载值或者默认值
      if (field.value != null) {
        $(this.container).find('input[name=' + field.name + ']').val(
          moment(field.value).format('YYYY-MM-DD'));
      }
    } else if (field.input == 'select') {
      let opts = field.options;
      // 加载值或者默认值
      opts.selection = field.value;
      $(this.container).find(' select[name=' + field.name + ']').searchselect(opts);
    } else if (field.input == 'cascade') {
      let opts = field.options;
      // 加载值或者默认值
      for (let j = 0; j < opts.levels.length; j++) {
        let level = opts.levels[j];
        if (typeof data[level.name] !== "undefined") {
          level.value = data[level.name];
        }
      }
      opts.readonly = this.readonly || false;
      $(this.container).find('div[data-cascade-name=' + field.name + ']').cascadeselect(opts);
    } else if (field.input == 'checklist') {
      field.options.name = field.name;
      field.options.readonly = this.readonly;
      new Checklist(field.options).render(dom.find('div[data-checklist-name=' + field.name + ']', container), {
        selections: data[field.name] || []
      });
    } else if (field.input == 'checktree') {
      new Checktree(field.options).render('#checktree_' + field.name);
    } else if (field.input == 'fileupload') {
      new FileUpload(field.options).render(dom.find('div[data-fileupload-name=' + field.name + ']', container));
    }
  }

  let buttonRow = dom.element('<div class="row"><div class="col-md-12"></div></div>');
  let buttons = dom.create('div', 'float-right');
  let buttonQuery = dom.create('button', 'btn', 'btn-sm', 'btn-query');
  buttonQuery.textContent = '查询';
  dom.bind(buttonQuery, 'click', function() {
    if (self.queryOpt.callback) {
      self.queryOpt.callback(dom.formdata(dom.find('.widget-query', this.container)));
    }
  });
  buttons.appendChild(buttonQuery);
  buttons.append(' ');
  let buttonReset = dom.create('button', 'btn', 'btn-sm', 'btn-reset');
  buttonReset.textContent = '重置';
  dom.bind(buttonReset, 'click', function() {
    $(dom.find('div.widget-query')).formdata({});
  });
  buttons.appendChild(buttonReset);
  buttons.append(' ');
  let buttonClose = dom.create('button', 'btn', 'btn-sm', 'btn-close');
  buttonClose.textContent = '关闭';
  dom.bind(buttonClose, 'click', function() {
    $(dom.find('div.widget-query')).removeClass('show');
  });
  buttons.appendChild(buttonClose);
  buttonRow.firstElementChild.appendChild(buttons);
  form.appendChild(buttonRow);
};

QueryLayout.prototype.getQuery = function() {
  return dom.formdata('.widget-query');
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
QueryLayout.prototype.createInput = function (field, columnCount) {
  let self = this;
  columnCount = columnCount || 1;
  let label = dom.create('div', columnCount == 2 ? 'col-md-2' : 'col-md-4', 'col-form-label');
  label.innerText = field.title + '：';
  let group = dom.create('div', columnCount == 2 ? 'col-md-4' : 'col-md-8', 'input-group');

  let input = null;
  if (field.input == 'select') {
    input = dom.create('select', 'form-control');
    input.style.width = '100%';
    input.disabled = this.readonly;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input == 'cascade') {
    input = dom.create('div', 'form-control');
    if (this.readonly)
      input.style.backgroundColor = 'rgb(240, 243, 245)';
    input.setAttribute('data-cascade-name', field.name);
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input == 'check') {
    for (let i = 0; i < field.values.length; i++) {
      let val = field.values[i];
      let check = dom.element(`
        <div class="form-check form-check-inline">
          <input id="" name="" value="" type="checkbox"
                 class="form-check-input checkbox color-primary is-outline">
          <label class="form-check-label" for=""></label>
        </div>
      `);
      dom.find('input', check).id = 'check_' + val.value;
      dom.find('input', check).name = field.name;
      if (field.value) {
        dom.find('input', check).checked = field.value == val.value;
      } else {
        dom.find('input', check).checked = val.checked == true;
      }
      dom.find('input', check).value = val.value;
      dom.find('label', check).setAttribute('for', 'check_' + val.value);
      dom.find('label', check).textContent = val.text;
      group.append(check);
    }
  } else {
    input = dom.create('input', 'form-control');
    input.disabled = this.readonly;
    input.setAttribute('name', field.name);
    input.setAttribute('placeholder', '请输入...');
  }
  if (input != null)
    group.appendChild(input);

  if (field.input == 'date') {
    input.setAttribute('data-domain-type', 'date');
    input.setAttribute('placeholder', '请选择...');
  } else if (field.input.indexOf('number') == 0) {
    input.setAttribute('data-domain-type', field.input);
  }

  let clear = dom.element('<div class="input-group-append pointer"><span class="input-group-text width-36 icon-error"></span></div>');
  dom.find('span', clear).innerHTML = ICON_CLEAR;
  dom.bind(clear, 'click', function() {
    dom.find('input', clear.parentElement).value = '';
  });

  if (field.input !== 'checklist' &&
    field.input !== 'longtext' &&
    field.input !== 'select' &&
    field.input !== 'check' &&
    field.input !== 'radio' &&
    field.input !== 'checktree' &&
    field.input !== 'fileupload')
    group.append(clear);

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
QueryLayout.prototype.createButton = function(action) {
  let self = this;
  let button = dom.create('button', 'btn', 'btn-sm', 'btn-' + action.role);
  button.innerText = action.text;
  button.addEventListener('click', action.click);
  return button;
};