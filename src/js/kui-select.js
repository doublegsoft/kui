/*
 * Copyright 2019 doublegsoft.net
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to 
 * deal in the Software without restriction, including without limitation the 
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
 * sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * 浏览器默认的简单下拉单选框。
 */
$.fn.simpleselect = function (opts) {
  let value = opts.fields.value;
  let text = opts.fields.text;
  let selection = opts.selection || '-1';
  let self = $(this);
  let dotIndex = value.indexOf('.');
  let objname = value.substr(0, dotIndex);
  let attrname = value.substr(dotIndex + 1);
  xhr.post({
    url: opts.url,
    data: opts.data || {},
    success: function (resp) {
      if (!resp.data) {
        return;
      }
      for (let i = 0; i < resp.data.length; i++) {
        let item = resp.data[i];
        let option = $('<option></option>');
        if (dotIndex == -1) {
          option.prop('selected', selection == item[value]);
          option.attr('value', item[value]);
        } else {
          option.prop('selected', selection == item[objname][attrname]);
          option.attr('value', item[objname][attrname]);
        }
        option.text(item[text]);
        self.append(option);
      }
    }
  });
};

/**
 * 可搜索的下拉单选框。
 */
$.fn.searchselect = function (opts) {
  let selection = opts.selection || null;
  let searchable = true;
  let complete = opts.complete || function (data) {};
  if (typeof opts.searchable !== 'undefined')
    searchable = opts.searchable;
  let select = opts.select;
  let onchange = opts.onchange;
  let validate = opts.validate || function(val) {};
  let variables = opts.variables;

  let value;
  let text;
  if (opts.values) {
    value = 'value';
    text = 'text';
  } else {
    value = opts.fields.value;
    text = opts.fields.text;
  }

  let self = $(this);
  if (opts.url) {
    if (variables && utils.isEmpty(variables)) {
      self.select2({
        placeholder: opts.placeholder,
        minimumResultsForSearch: searchable ? 0 : Infinity,
        liveSearch: true,
        allowClear: true,
      });
      return;
    };

    let dotIndex = value.indexOf('.');
    let objname = value.substr(0, dotIndex);
    let attrname = value.substr(dotIndex + 1);
    variables = variables || {};
    let params = opts.data || opts.params || {};
    for (let key in variables) {
      params[key] = variables[key];
    }
    xhr.post({
      url: opts.url,
      usecase: opts.usecase,
      data: params,
      success: function (resp) {
        if (!resp.data) {
          resp.data = [];
        }
        let hasSelected = false;
        self.empty();
        for (let i = 0; i < resp.data.length; i++) {
          let item = resp.data[i];
          let option = $('<option></option>');

          if (dotIndex == -1) {
            option.prop('selected', selection == item[value]);
            option.attr('value', item[value]);
            hasSelected = hasSelected ? hasSelected : selection == item[value];
          } else {
            option.prop('selected', selection == item[objname][attrname]);
            option.attr('value', item[objname][attrname]);
            hasSelected = hasSelected ? hasSelected : selection == item[objname][attrname];
          }
          if (typeof text === 'function') {
            option.text(text.apply(null, [item]));
          } else {
            option.text(item[text]);
          }

          self.append(option);
        }
        self.select2({
          placeholder: opts.placeholder,
          minimumResultsForSearch: searchable ? 0 : Infinity,
          liveSearch: true,
          allowClear: true,
        });
        self.on('change', function(evt) {
          validate(self.get(0));
          if (onchange) onchange(self.get(0).value);
        });
        if (select) {
          if (!hasSelected) {
            self.val(resp.data[0][value]);
          }
          select(self.val());
        } else {
          self.val(selection).trigger('change');
        }
        complete(resp.data);
      }
    });
  } else if (opts.local || opts.values) {
    let values = opts.local || opts.values;
    for (let i = 0; i < values.length; i++) {
      $(this).append('<option value="' + values[i][value] + '">' + values[i][text] + '</option>');
    }
    $(this).val(selection);
    $(this).select2({
      liveSearch: false,
      allowClear: true,
      minimumResultsForSearch: searchable ? 0 : Infinity,
      placeholder: opts.placeholder,
    });
    if (selection && select) {
      select(selection);
    }
    $(this).on('change', function(evt) {
      validate($(this).get(0));
      if (onchange) onchange(evt);
    });
    validate($(this).get(0));
    complete(values);
  } else {
    $(this).val(selection);
    $(this).select2({
      liveSearch: false,
      allowClear: true,
      minimumResultsForSearch: searchable ? 0 : Infinity,
      placeholder: opts.placeholder,
    });
    if (selection && select) {
      select(selection);
    }
    $(this).on('change', function(evt) {
      validate($(this).get(0));
      if (onchange) onchange($(this).get(0).vallue);
    });
    validate($(this).get(0));
    complete([]);
  }
  return this;
};

$.fn.multiselect = function (opts) {
  var value = opts.value;
  var text = opts.text;
  var self = $(this);
  xhr.post({
    url: opts.url,
    data: opts.params || {},
    success: function (resp) {
      if (!resp.data) return;
      for (var i = 0; i < resp.data.length; i++) {
        var item = resp.data[i];
        var option = $('<option></option>');
        option.attr('value', item[value]);
        option.text(item[text]);
        self.append(option);
      }
      self.selectpicker();
    }
  });
};

$.fn.dialogselect = function (opts) {
  let templateId = opts.templateId;
  let fieldId = opts.fields.id;
  let fieldParentId = opts.fields.parentId;
  let url = opts.url;
  let data = opts.data;
  let title = opts.title;
  let confirm = opts.confirm;
  let self = $(this);
  let htmlNormal = self.html();
  let htmlLoading = '<i class="fa fa-spin fa-spinner"></i>';
  let htmlChecked = '<i class="fas fa-check float-right"></i>';
  data.fieldId = fieldId;
  data.fieldParentId = fieldParentId;
  $(this).on('click', function() {
    $('button[type=setting]').prop('disabled', true);
    self.html(htmlLoading);
    xhr.post({
      url: url,
      data: data,
      success: function (resp) {
        let buttons =
          '<div class="form-buttons float-right" style="padding-top: 12px; padding-right: 15px;">' +
          '  <button class="btn btn-sm btn-confirm">确定</button>' +
          '  <button class="btn btn-sm btn-close" onclick="layer.close(layer.index);">关闭</button>' +
          '</div>';
        if (!resp.data) return;
        let source = document.getElementById(templateId).innerHTML;
        let template = Handlebars.compile(source);
        let html = template(resp) + buttons;
        layer.open({
          type : 1,
          offset: '120px',
          title : title,
          closeBtn: 0,
          shadeClose : false,
          area : [opts.width, ''],
          content : html,
          success: function (layero, index) {
            let layerContent = document.querySelector('.layui-layer-content');
            layerContent.style += '; overflow: hidden;';
            $('.kui-dialog').css('padding', '15px 25px 25px 25px');
            self.html(htmlNormal);
            $('button[type=setting]').prop('disabled', false);

            // bind event listener
            let listItems = layerContent.querySelectorAll('li');
            for (let i = 0; i < listItems.length; i++) {
              let li = listItems[i];
              li.attributes['data-checked'] = false;
              li.addEventListener('click', function() {
                let divs = li.querySelectorAll('.col-md-2');
                let div = divs[divs.length - 1];
                let checked = li.attributes['data-checked'];
                li.attributes['data-checked'] = !checked;
                if (!checked) {
                  div.innerHTML = htmlChecked;
                } else {
                  div.innerHTML = '';
                }
              });
            }
            let buttonConfirm = layerContent.querySelector('.btn-confirm');
            buttonConfirm.addEventListener('click', function() {
              let selections = [];
              for (let i = 0; i < listItems.length; i++) {
                let li = listItems[i];
                if (li.attributes['data-checked']) {
                  selections.push({
                    id: li.attributes['data-id']
                  });
                }
              }
              confirm(selections);
              layer.close(layer.index);
            });
          }
        });
      }
    });
  });
};

$.fn.autocomplete = function (opts) {
  var value = opts.value;
  var text = opts.text;
  var self = $(this);
  xhr.post({
    url: opts.url,
    data: opts.params || {},
    success: function (resp) {
      if (!resp.data) return;
      for (var i = 0; i < resp.data.length; i++) {
        var item = resp.data[i];
        var option = $('<option></option>');
        option.attr('value', item[value]);
        option.text(item[text]);
        self.append(option);
      }
      self.select2({});
    }
  });
};

/**
 * 瓦片式布局多项选择器。
 */
$.fn.tiledmultiselect = function(opts) {
  let container = document.getElementById($(this).attr('id'));
  let data = opts.data || [];
  let fields = opts.fields;
  let usecase = opts.usecase;
  let url = opts.url;
  let check = opts.check || function (value, text) {};
  let uncheck = opts.uncheck || function (vlaue, text) {};

  function renderItem(data) {
    for (let i = 0; i < data.length; i++) {
      let div = document.createElement('div');
      div.classList.add('tag-checkable', 'mh-10');
      let icon = document.createElement('i');
      icon.classList.add('fa', 'fa-check', 'pr-2');
      if (!data[i].checked) {
        div.setAttribute('data-checked', "false");
        icon.classList.add('text-white');
      } else {
        div.setAttribute('data-checked', "true");
      }
      div.setAttribute('data-id', data[i][fields.value]);
      div.append(icon);
      div.append(data[i][fields.text]);
      div.addEventListener('click', function(event) {
        let icon = this.querySelector('i');
        if (this.getAttribute('data-checked') == 'false') {
          this.setAttribute('data-checked', 'true');
          icon.classList.remove('text-white');
          check(this.getAttribute('data-id'), this.innerText);
        } else {
          this.setAttribute('data-checked', 'false');
          icon.classList.add('text-white');
          uncheck(this.getAttribute('data-id'), this.innerText);
        }
        event.preventDefault();
        event.stopPropagation();
      });
      container.append(div);
    }
  }

  if (opts.local) {
    renderItem(opts.local);
    return;
  }

  xhr.post({
    url: url,
    usecase: usecase,
    data: data,
    success: function(resp) {
      if (resp.error) {
        dialog.error(resp.error.message);
        return;
      }
      renderItem(resp.data);
    }
  });
};

/**
 * 层叠式的选择器。
 */
$.fn.cascadeselect = function(opts) {
  let levels = opts.levels;
  let values = opts.values;
  let readonly = opts.readonly;
  let container = $(this).get(0);
  let rectContainer = container.getBoundingClientRect();
  let widthContainer = rectContainer.width;
  let levelCount = opts.levels.length;
  let validate = opts.validate;

  async function displayPopup(link, params, values) {
    // 【选中下划线】渲染
    document.querySelectorAll('.cascadeselect-link').forEach(function(elm, idx) {
      elm.style.borderBottom = 'none';
    });
    link.style.borderBottom = '2px solid #1976D2';
    dom.model(link, params);
    let url = link.getAttribute('data-url');
    params = params || {};
    params.cascadeIndex = link.getAttribute('data-cascade-index');
    let container = link.parentElement.parentElement;
    let popup = dom.find('.cascadeselect-popup');
    if (popup == null) {
      popup = dom.create('div', 'row', 'b-a-1', 'mt-0', 'cascadeselect-popup');
      popup.style.overflowY = 'auto';
      popup.style.width = widthContainer + 'px';
      popup.style.maxHeight = '200px';
      popup.style.position = 'relative';
      popup.style.zIndex = 99999;
      popup.style.backgroundColor = 'white';
    }
    popup.style.display = '';
    popup.innerHTML = '';
    let requestParams = {};
    if (params['_and_condition']) {
      requestParams['_and_condition'] = params['_and_condition'];
      requestParams['_other_select'] = params['_other_select'];
    } else {
      requestParams = params;
    }
    requestParams[link.getAttribute('data-cascade-field-value')] = '';

    let data = [];
    if (url && url !== 'undefined') {
      data = await xhr.promise({
        url: url,
        params: requestParams,
      });
    } else {
      let cascadeIndex = parseInt(link.getAttribute('data-cascade-index'));
      if (cascadeIndex === 0) {
        data = values;
      } else {
        let selectOptions = link.getAttribute('data-cascade-options');
        if (selectOptions) {
          data = JSON.parse(selectOptions);
        } else {
          data = values;
          link.setAttribute('data-cascade-options', JSON.stringify(values));
        }
      }

    }
    for (let i = 0; i < data.length; i++) {
      let dataItem = data[i];
      let linkPopup = dom.create('a', 'btn', 'btn-link');
      if (dataItem[link.getAttribute('data-cascade-field-text')]) {
        linkPopup.innerText = dataItem[link.getAttribute('data-cascade-field-text')];
      }
      // set data-model-*
      dom.model(linkPopup, dataItem);
      // 选中点击事件
      linkPopup.addEventListener('click', function(event) {
        let cascadeIndex = parseInt(link.getAttribute('data-cascade-index'));
        let cascadeName = link.getAttribute('data-cascade-name');
        // let cascadeFieldValue = link.getAttribute('data-cascade-field-value');
        let cascadeFieldValue = link.getAttribute('data-cascade-field-value');
        let cascadeFieldText = link.getAttribute('data-cascade-field-text');
        let model = dom.model(this);
        link.setAttribute('data-cascade-value', model[cascadeFieldValue]);
        if (model[cascadeFieldText]) {
          link.innerText = model[cascadeFieldText];
        }
        dom.find('input', link.parentElement).value = model[cascadeFieldValue];
        dom.model(link, model);
        if (cascadeIndex < levelCount - 1) {
          let next = dom.find('a[data-cascade-index="' + (cascadeIndex + 1) + '"]', container);
          //清空下一级的数据
          next.setAttribute('data-cascade-value', '');
          next.innerText='请选择';
          dom.find('input', next.parentElement).value = '';

          let data = {};
          data[cascadeName] = model[cascadeFieldValue];
          let params = {};
          for (let key in levels[cascadeIndex + 1].params) {
            let tpl = Handlebars.compile(levels[cascadeIndex + 1].params[key]);
            params[key] = tpl(data);
          }
          next.removeAttribute('data-cascade-options');
          if (model.children) {
            displayPopup(next, params, JSON.parse(model.children), cascadeIndex);
          } else {
            displayPopup(next, params, cascadeIndex);
          }
          // 阻止繁殖的click事件
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();
        }
        if (validate)
          validate(link.parentElement.parentElement);
      });
      popup.appendChild(linkPopup);
    }

    container.appendChild(popup);
  }

  for (let i = 0; i < levels.length; i++) {
    let level = levels[i];
    let div = dom.create('div');
    div.style.width = level.width;
    div.style.display = 'inline-block';
    div.style.textAlign = 'center';
    div.style.textOverflow = 'ellipsis';
    div.style.overflow = 'hidden';
    div.style.whiteSpace = 'nowrap';

    let link = dom.create('a', 'btn', 'pb-1', 'cascadeselect-link');
    link.style.paddingTop = '1px';
    if (level.url) {
      link.setAttribute('data-url', level.url);
    }
    // link.setAttribute('data-usecase', level.usecase);
    link.setAttribute('data-cascade-index', i);
    link.setAttribute('data-cascade-name', level.name);
    link.setAttribute('data-cascade-field-value', level.fields.value);
    link.setAttribute('data-cascade-field-text', level.fields.text);
    link.style.borderRadius = 'unset';
    dom.model(link, level.params || {});

    if (level.value && level.value[level.fields.text]) {
      link.innerText = level.value[level.fields.text];
      link.setAttribute('data-cascade-value', level.value[level.fields.value] || level.value[level.name]);
    } else {
      link.innerText = level.text;
    }

    link.addEventListener('click', function() {
      if (opts.readonly) return;
      let params = dom.model(this);
      if (i - 1 >= 0) {
        let prev = dom.find('a', link.parentElement.previousElementSibling.previousElementSibling);
        let selected = prev.getAttribute('data-cascade-value');
        if (selected == null || selected == '') return;
        params[prev.getAttribute('data-cascade-name')] = selected;
        // for (let key in levels[i].params) {
        //   let tpl = Handlebars.compile(levels[i].params[key]);
        //   // params[key] = tpl(data);
        // }
      }
      // 去掉多余的参数
      for (let key in params) {
        if (key.indexOf('_') == 0) continue;
        if (key != levels[i].fields.value) {
          delete params[key];
        }
      }
      displayPopup(this, params, values);
    });

    if (i != levels.length - 1) {
      div.style.marginRight = '5px';
    }
    if (i > 0) {
      div.style.marginLeft = '3px';
    }

    let hidden = dom.create('input');
    hidden.setAttribute('type', 'hidden');
    if (opts.required)
      hidden.setAttribute('data-required', level.text);
    hidden.setAttribute('name', level.name);
    if (level.value && level.value[level.fields.value]) {
      hidden.value = level.value[level.fields.value];
    }
    div.appendChild(link);
    div.appendChild(hidden);
    container.appendChild(div);
    if (i != levels.length - 1) {
      let separator = dom.create('span');
      separator.textContent = '/';
      separator.style.position = 'absolute';
      separator.style.top = '8px';
      container.append(separator);
    }

    // validate them if having default value
    if (validate)
      validate(link.parentElement.parentElement);
  }

  function hidePopup(event) {
    let clickedElement = document.elementFromPoint(event.clientX, event.clientY);
    if (clickedElement.className.indexOf('cascadeselect') == -1) {
      let popup = dom.find('.cascadeselect-popup');
      if (popup != null) {
        document.querySelectorAll('.cascadeselect-link').forEach(function(elm, idx) {
          elm.style.borderBottom = 'none';
        });
        popup.remove();
      }
    }
  }

  document.removeEventListener('click', hidePopup);
  document.addEventListener('click', hidePopup);
};