/**
 *
 * @constructor
 */
function Kesigner() {

}

////////////////////////////////////////////////////////////////////////////////
//
// FACTORY FUNCTIONS
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.getComponent = function(type) {
  if (type === 'row') {
    return new Kesigner.Row();
  } if (type === 'column') {
    return new Kesigner.Column();
  } else if (type === 'panel') {
    return new  Kesigner.Panel();
  } else if (type === 'form') {
    return new Kesigner.Form();
  } else if (type === 'table') {
    return new Kesigner.Table();
  } else if (type === 'chart') {
    return new Kesigner.Chart();
  }
  return null;
};

Kesigner.getElement = function(component) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(component.html(), 'text/html');
  let properties = component.properties();
  let values ={};
  for (let i = 0; i < properties.length; i++) {
    let propertyGroup = properties[i];
    values[propertyGroup.name] = {};
    if (propertyGroup.multiple) {
      values[propertyGroup.name] = propertyGroup.value || [];
    }
    for (let j = 0; propertyGroup.items && j < propertyGroup.items.length; j++) {
      let propertyItem = propertyGroup.items[j];
      values[propertyGroup.name][propertyItem.name] = propertyItem.value;
    }
  }
  let ret = doc.body.firstChild;
  ret.setAttribute('data-values', JSON.stringify(values));
  return doc.body.firstChild;
};

Kesigner.getFragment = function (component) {
  let range = document.createRange();
  let fragment = range.createContextualFragment(component.html());
  let element = fragment.firstElementChild;
  let properties = component.properties();
  let values ={};
  for (let i = 0; i < properties.length; i++) {
    let propertyGroup = properties[i];
    values[propertyGroup.name] = {};
    if (propertyGroup.multiple) {
      values[propertyGroup.name] = propertyGroup.value || [];
    }
    for (let j = 0; propertyGroup.items && j < propertyGroup.items.length; j++) {
      let propertyItem = propertyGroup.items[j];
      values[propertyGroup.name][propertyItem.name] = propertyItem.value;
    }
  }
  element.setAttribute('data-values', JSON.stringify(values));
  return fragment;
};

Kesigner.getProperties = function(type) {
  let component = Kesigner.getComponent(type);
  return component.properties();
};

Kesigner.getPropertyItem = function(propertyGroup, propertyItem, value) {
  if (propertyItem.type == 'boolean') {
    return Kesigner.createSwitch(propertyGroup, propertyItem, value);
  } else if (propertyItem.type.indexOf('range') == 0) {
    return Kesigner.createRange(propertyGroup, propertyItem, value);
  } else if (propertyItem.type == 'number') {
    return Kesigner.createNumber(propertyGroup, propertyItem, value);
  } else {
    return Kesigner.createText(propertyGroup, propertyItem, value);
  }
};

Kesigner.resizeComponent = function (data) {
  let selectable = document.querySelector('.kesigner-selected');
  if (data.name == 'colspan') {
    for (let i = 0; i < selectable.classList.length; i++) {
      let clazz = selectable.classList[i];
      if (clazz.indexOf('col-md-') == 0) {
        selectable.classList.remove(clazz);
        selectable.classList.add('col-md-' + data.value);
        Kesigner.value(selectable, data.group, data.name, data.value);
        break;
      }
    }
  } else if (data.name == 'height') {
    selectable.style.height = data.value + 'px';
  }
  // 如果有脚本，就要重新执行
  let script = selectable.nextElementSibling;
  if (script && script.nodeName == 'SCRIPT') {
    eval(script.innerText);
  }
};

Kesigner.createSwitch = function(propertyGroup, propertyItem, value) {
  let div = document.createElement('div');
  let label = document.createElement('label');
  label.classList.add('c-switch', 'c-switch-label', 'c-switch-success');
  let input = document.createElement('input');
  input.type = 'checkbox';
  input.classList.add('c-switch-input');
  if (value == true)
    input.checked = true;
  else
    input.checked = false;

  input.addEventListener('input', propertyItem.change);
  input.setAttribute('data-group', propertyGroup.name);
  input.setAttribute('data-name', propertyItem.name);
  let span = document.createElement('span');
  span.classList.add('c-switch-slider');
  span.setAttribute('data-checked', '是');
  span.setAttribute('data-unchecked', '否');

  label.appendChild(input);
  label.appendChild(span);
  div.appendChild(label);

  return div;
};

Kesigner.createText = function(propertyGroup, propertyItem, value) {
  let input = document.createElement('input');
  input.classList.add('group-item-input');
  input.setAttribute('data-group', propertyGroup.name);
  input.setAttribute('data-name', propertyItem.name);
  input.value = value || '';
  if (typeof propertyItem.change !== 'undefined') {
    input.addEventListener('input', propertyItem.change);
  }
  return input;
};

Kesigner.createRange = function(propertyGroup, propertyItem, value) {
  let input = document.createElement('input');
  input.classList.add('group-item-input');
  input.setAttribute('data-group', propertyGroup.name);
  input.setAttribute('data-name', propertyItem.name);
  input.value = value;
  input.type = 'range';

  if (typeof propertyItem.change !== 'undefined') {
    input.addEventListener('input', propertyItem.change);
  }

  let minAndMax = propertyItem.type.replace('range[', '').replace(']', '').split(',');
  input.setAttribute('min', parseInt(minAndMax[0]));
  input.setAttribute('max', parseInt(minAndMax[1]));
  input.setAttribute('step', 1);
  return input;
};

Kesigner.createNumber = function(propertyGroup, propertyItem, value) {
  let input = document.createElement('input');
  input.classList.add('group-item-input');
  input.setAttribute('data-group', propertyGroup.name);
  input.setAttribute('data-name', propertyItem.name);
  input.value = value;
  input.type = 'number';
  if (typeof propertyItem.change !== 'undefined') {
    input.addEventListener('input', propertyItem.change);
  }
  return input;
};

Kesigner.createMultiple = function(propertyGroup, value) {
  let rows = document.createElement('table');
  rows.classList.add('table', 'mb-0');

  let vals = value;
  for (let i = 0; (typeof vals !== 'undefined') && i < vals.length; i++) {
    let row = document.createElement('tr');

    let cell = document.createElement('td');
    cell.classList.add('p-0', 'b-t-0')

    let linkDetail = document.createElement('a');
    linkDetail.classList.add('btn', 'btn-link', 'float-right', 'pt-0');
    let iconDetail = document.createElement('i');
    iconDetail.classList.add('fas', 'fa-ellipsis-h');
    linkDetail.appendChild(iconDetail);

    let span = document.createElement('span');
    span.innerText = vals[i][propertyGroup.multiple[0].name];
    cell.appendChild(span);
    cell.appendChild(linkDetail);
    row.appendChild(cell);
    rows.appendChild(row);
  }
  return rows;
};

/**
 * 输入框值改变时回写值。
 */
Kesigner.value = function(selectable, group, item, value) {
  let values = JSON.parse(selectable.getAttribute('data-values'));
  for (let key in values) {
    if (key == group) {
      for (let keyInner in values[group]) {
        if (keyInner == item) {
          values[group][item] = value;
          break;
        }
      }
      break;
    }
  }
  selectable.setAttribute('data-values', JSON.stringify(values));
};

Kesigner.select = function(container, propertiesEditor, x, y) {
  Kesigner.unselect(container);
  let element = document.elementFromPoint(x, y);
  let selectable = Kesigner.findSelectableElement(element);
  if (selectable == null && propertiesEditor)  {
    propertiesEditor.clear();
    return;
  }
  selectable.classList.add('kesigner-selected');

  // 更新属性编辑
  let properties = Kesigner.getProperties(selectable.getAttribute('data-type'));
  let values = JSON.parse(selectable.getAttribute("data-values"));
  if (propertiesEditor)
    propertiesEditor.render(properties, values);
};

Kesigner.unselect = function(container) {
  let selected = container.querySelector('.kesigner-selected');
  if (selected != null) {
    selected.classList.remove('kesigner-selected');
  }
};

Kesigner.findSelectableElement = function(element) {
  if (element == null) return null;
  if (element.getAttribute('data-selectable') == 'true') return element;
  return Kesigner.findSelectableElement(element.parentElement);
};

////////////////////////////////////////////////////////////////////////////////
//
// PROPERTIES EDITOR
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.PropertiesEditor = function(containerId) {
  this.containerId = containerId;
};

Kesigner.PropertiesEditor.prototype.render = function(properties, values) {
  let container = document.getElementById(this.containerId);
  container.innerHTML = '';

  values = values || {};
  for (let i = 0; i < properties.length; i++) {
    this.createPropertyGroup(container, properties[i], values[properties[i].name]);
  }
};

Kesigner.PropertiesEditor.prototype.clear = function(properties, values) {
  let container = document.getElementById(this.containerId);
  container.innerHTML = '';
};

/**
 * @private
 */
Kesigner.PropertiesEditor.prototype.createPropertyGroup = function(container, propertyGroup, valueGroup) {
  let group = document.createElement('div');

  group.classList.add('group');
  group.setAttribute('data-name', propertyGroup.name);

  let h3 = document.createElement('div');
  h3.classList.add('group-title', 'mb-1', 'font-14');

  let link = document.createElement('a');
  let icon = document.createElement('i');
  link.addEventListener('click', function() {
    let group = this.parentElement.parentElement;
    let icon = this.querySelector('i');
    let groupBody = group.querySelector('.group-body');
    if (groupBody.style.display == 'none') {
      icon.classList.remove('icon-plus');
      icon.classList.add('icon-minus');
      groupBody.style.display = '';
    } else {
      icon.classList.remove('icon-minus');
      icon.classList.add('icon-plus');
      groupBody.style.display = 'none';
    }
  });
  if (propertyGroup.multiple) {
    let linkAdd = document.createElement('a');
    linkAdd.classList.add('btn', 'btn-link', 'float-right', 'pr-1');
    let iconAdd = document.createElement('i');
    iconAdd.classList.add('fas', 'fa-folder-plus');
    iconAdd.style.color = '#9093b1';
    linkAdd.appendChild(iconAdd);
    h3.appendChild(linkAdd);
  }

  link.classList.add('btn', 'btn-link');
  icon.classList.add('icon-minus');

  link.appendChild(icon);
  h3.appendChild(link);
  let span = document.createElement('span');
  span.innerText = propertyGroup.text;
  h3.appendChild(span);
  group.appendChild(h3);

  container.appendChild(group);

  let groupBody = document.createElement('div');
  groupBody.classList.add('group-body');
  groupBody.style.display = '';
  group.appendChild(groupBody);

  if (propertyGroup.multiple) {
    groupBody.appendChild(Kesigner.createMultiple(propertyGroup, valueGroup));
  }
  propertyGroup.items = propertyGroup.items || [];
  for (let i = 0; i < propertyGroup.items.length; i++) {
    let propertyItem = propertyGroup.items[i];
    this.createPropertyItem(groupBody, propertyGroup, propertyItem, valueGroup[propertyItem.name]);
  }
};

/**
 * @private
 */
Kesigner.PropertiesEditor.prototype.createPropertyItem = function (parent, propertyGroup, propertyItem, valueItem) {
  let div = document.createElement('div');
  div.classList.add('group-item');
  let label = document.createElement('label');
  label.classList.add('group-item-label');
  label.innerText = propertyItem.text + '：';

  div.appendChild(label);
  div.appendChild(Kesigner.getPropertyItem(propertyGroup, propertyItem, valueItem));

  parent.appendChild(div);
};

////////////////////////////////////////////////////////////////////////////////
//
// ROW LAYOUT
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Row = function () {

};

Kesigner.Row.prototype.html = function() {
  return `
  <div class="row kesigner-row" data-type="row"  style="height: 200px;" data-selectable="true"></div>
  `;
};

/**
 * Gets property model of row layout object.
 */
Kesigner.Row.prototype.properties = function () {
  return [{
    name: 'size',
    text: '大小',
    items: [{
      name: 'height',
      text: '高度',
      type: 'number',
      value: 200,
      change: function() {
        Kesigner.resizeComponent({
          group: this.getAttribute('data-group'),
          name: this.getAttribute('data-name'),
          value: this.value
        });
      }
    }]
  }];
};

////////////////////////////////////////////////////////////////////////////////
//
// COLUMN LAYOUT
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Column = function () {

};

Kesigner.Column.prototype.html = function() {
  return `
  <div class="col-md-4 kesigner-column" style="height: 200px;" data-type="column" data-selectable="true"></div>
  `;
};

/**
 * Gets property model of row layout object.
 */
Kesigner.Column.prototype.properties = function () {
  return [{
    name: 'size',
    text: '大小',
    items: [{
      name: 'colspan',
      text: '列宽',
      type: 'range[1,12]',
      value: 4,
      change: function() {
        Kesigner.resizeComponent({
          group: this.getAttribute('data-group'),
          name: this.getAttribute('data-name'),
          value: this.value
        });
      }
    },{
      name: 'height',
      text: '高度',
      type: 'number',
      value: 200,
      change: function() {
        Kesigner.resizeComponent({
          group: this.getAttribute('data-group'),
          name: this.getAttribute('data-name'),
          value: this.value
        });
      }
    }]
  },{
    name: 'widget',
    text: '部件',
    items: [{
      name: 'name',
      text: '名称',
      type: 'select'
    },{
      name: 'options',
      text: '配置项',
      type: 'code'
    }]
  }];
};

////////////////////////////////////////////////////////////////////////////////
//
// PANEL
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Panel = function() {

};

Kesigner.Panel.prototype.html = function() {
  return `
  <div class="col-md-4" data-type="panel" data-selectable="true">
    <div class="card">
      <div class="card-header">标题</div>  
      <div class="card-body height200"></div>
    </div>
  </div>
  `;
};

Kesigner.Panel.prototype.properties = function() {
  return [{
    name: 'title',
    text: '标题栏',
    items: [{
      name: 'text', text: '标题', type: 'string', value: '标题',
      change: function() {
        let selectable = document.querySelector('.kesigner-selected');
        let cardHeader = selectable.querySelector('.card-header');
        cardHeader.innerText = this.value;
        Kesigner.value(selectable, this.getAttribute('data-group'), this.getAttribute('data-name'), this.value);
      }
    }, {
      name: 'parameterizable', text: '参数化', type: 'boolean', value: false
    }, {
      name: 'visible', text: '显示', type: 'boolean', value: true,
      change: function() {
        let selectable = document.querySelector('.kesigner-selected');
        let cardHeader = selectable.querySelector('.card-header');
        cardHeader.style.display = this.checked ? '' : 'none';
        Kesigner.value(selectable, this.getAttribute('data-group'), this.getAttribute('data-name'), this.checked);
      }
    }]
  }, {
    name: 'position',
    text: '位置及大小',
    items: [{
      name: 'colspan', text: '列宽', type: 'range[1,12]', value: 4,
      change: function() {
        Kesigner.resizeComponent({
          group: this.getAttribute('data-group'),
          name: this.getAttribute('data-name'),
          value: this.value
        });
      }
    }]
  }, {
    name: 'preferences',
    text: '偏好',
    items: [{
      name: 'collapsible', text: '可折叠', type: 'boolean', value: false
    }]
  }, {
    name: 'actions',
    text: '菜单',
    multiple: true,
    items: [{
      name: 'name', text: '名称', type: 'string'
    }, {
      name: 'action', text: '操作', type: 'string', reference: 'action'
    }]
  }]
};

////////////////////////////////////////////////////////////////////////////////
//
// TABLE
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Table = function() {

};

Kesigner.Table.prototype.html = function () {
  return `
  <table class="table table-responsive-sm table-hover table-outline mb-0" data-type="table" data-selectable="true">
  <thead class="thead-light">
  <tr>
    <th class="text-center"></th>
    <th>用户</th>
    <th class="text-center">国籍</th>
    <th>用途</th>
    <th class="text-center">支付方式</th>
    <th>活动</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td class="text-center">
      <div class="c-avatar"><span class="c-avatar-status bg-success"></span></div>
    </td>
    <td>
      <div>Yiorgos Avraamu</div>
      <div class="small text-muted"><span>New</span> | Registered: Jan 1, 2015</div>
    </td>
    <td class="text-center">
      <i class="fa fa-flag"></i>
    </td>
    <td>
      <div class="clearfix">
        <div class="float-left"><strong>50%</strong></div>
        <div class="float-right"><small class="text-muted">Jun 11, 2015 - Jul 10, 2015</small></div>
      </div>
      <div class="progress progress-xs">
        <div class="progress-bar bg-gradient-success" role="progressbar" style="width: 50%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </td>
    <td class="text-center">
      <i class="fa fa-cash-register"></i>
    </td>
    <td>
      <div class="small text-muted">Last login</div><strong>10 sec ago</strong>
    </td>
  </tr>
  </tbody>
</table>
  `
};

Kesigner.Table.prototype.properties = function() {
  return [{
    name: 'columns',
    text: '列',
    multiple: [{
      name: 'title',
      type: 'text'
    }, {
      name: 'name',
      type: 'text'
    }],
    value: [{
      title: '用户'
    },{
      title: '国籍'
    },{
      title: '用途'
    },{
      title: '支付方式'
    },{
      title: '活动'
    }]
  }, {
    name: 'operations',
    text: '操作',
    items: [{
      name: 'name', text: '名称', type: 'string'
    }, {
      name: 'action', text: '操作', type: 'string', reference: 'action'
    }]
  }]
};

////////////////////////////////////////////////////////////////////////////////
//
// FORM
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Form = function() {

};

Kesigner.Form.prototype.html = function() {
  return `
  <div class="col-md-12 pb-5" data-type="form" data-selectable="true">
    <div class="form form-horizontal">
      <div class="form-group row">
        <label class="col-md-2 col-form-label">姓名：</label>
        <div class="col-md-4">
          <input class="form-control">
        </div>
        <label class="col-md-2 col-form-label">手机：</label>
        <div class="col-md-4">
          <input class="form-control">
        </div>
      </div>
    </div>
    <div class="float-right">
      <button type="button" role="save" class="btn btn-sm btn-save">保存</button>
      <button type="button" role="back" class="btn btn-sm btn-back">返回</button>
    </div>
  </div>
  `;
};

Kesigner.Form.prototype.properties = function() {
  return [{
    name: 'fields',
    text: '表单项',
    multiple: [{
      name: 'label',
      text: '标题',
      type: 'string',
    }, {
      name: 'type',
      text: '类型',
      type: 'string'
    }, {
      name: 'required',
      text: '必填',
      type: 'boolean'
    }],
    value: [{
      label: '姓名',
      type: 'text',
    }, {
      label: '手机',
      type: 'text'
    }]
  }, {
    name: 'actions',
    text: '操作项',
    multiple: [{
      name: 'text',
      text: '标题',
      type: 'string',
    }, {
      name: 'role',
      text: '作用',
      type: 'string'
    }],
    value: [{
      text: '保存',
      role: 'save'
    }, {
      text: '返回',
      role: 'back'
    }]
  }]
};

////////////////////////////////////////////////////////////////////////////////
//
// Chart
//
////////////////////////////////////////////////////////////////////////////////

Kesigner.Chart = function() {

};

Kesigner.Chart.prototype.html = function () {
  return `
  <div class="col-md-4 height300" data-type="chart" data-selectable="true">
  </div>
  <script>
  data = [
    {date: '2020-01-01', group: '1', groupName: '药品', value0: 100, value1: 200},
    {date: '2020-01-02', group: '1', groupName: '药品', value0: 110, value1: 220},
    {date: '2020-01-03', group: '1', groupName: '药品', value0: 120, value1: 240},
    {date: '2020-01-04', group: '1', groupName: '药品', value0: 130, value1: 260},
    {date: '2020-01-05', group: '1', groupName: '药品', value0: 140, value1: 280},
    {date: '2020-01-06', group: '1', groupName: '药品', value0: 150, value1: 300},
    {date: '2020-01-07', group: '1', groupName: '药品', value0: 150, value1: 300},
    {date: '2020-01-01', group: '2', groupName: '耗材', value0: 100, value1: 200},
    {date: '2020-01-02', group: '2', groupName: '耗材', value0: 110, value1: 220},
    {date: '2020-01-03', group: '2', groupName: '耗材', value0: 120, value1: 240},
    {date: '2020-01-04', group: '2', groupName: '耗材', value0: 130, value1: 260},
    {date: '2020-01-05', group: '2', groupName: '耗材', value0: 140, value1: 280},
    {date: '2020-01-06', group: '2', groupName: '耗材', value0: 150, value1: 300},
    {date: '2020-01-07', group: '2', groupName: '耗材', value0: 150, value1: 300},
    {date: '2020-01-01', group: '3', groupName: '服务', value0: 100, value1: 200},
    {date: '2020-01-02', group: '3', groupName: '服务', value0: 110, value1: 220},
    {date: '2020-01-03', group: '3', groupName: '服务', value0: 120, value1: 240},
    {date: '2020-01-04', group: '3', groupName: '服务', value0: 130, value1: 260},
    {date: '2020-01-05', group: '3', groupName: '服务', value0: 140, value1: 280},
    {date: '2020-01-06', group: '3', groupName: '服务', value0: 150, value1: 300},
    {date: '2020-01-07', group: '3', groupName: '服务', value0: 150, value1: 300}
  ];
  chart.bar('.kesigner-selected', {
    values: [{
      name: 'value0',
      text: '毛利润',
      operator: 'sum',
      color: '#B71C1C'
    }, {
      name: 'value1',
      text: '销售额',
      operator: 'sum',
      color: '#0D47A1'
    }],
    category: {
      name: 'date'
    },
    data: data
  });
  </script>
  `;
};

Kesigner.Chart.prototype.properties = function () {
  return [{
    name: 'position',
    text: '位置及大小',
    items: [{
      name: 'colspan', text: '列宽', type: 'range[1,12]', value: 4,
      change: function() {
        Kesigner.resizeComponent({
          group: this.getAttribute('data-group'),
          name: this.getAttribute('data-name'),
          value: this.value
        });
      }
    }]
  }, {
    name: 'dataset',
    text: '数据集',
    items: [{
      name: 'source', text: '来源', type: 'string', reference: 'dataset'
    }]
  }, {
    name: 'legend',
    text: '图例',
    multiple: true,
    items: [{
      name: 'source', text: '列名', type: 'string'
    }]
  }]
};