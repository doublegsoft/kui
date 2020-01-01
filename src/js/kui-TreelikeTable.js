
/**
 *
 * @param opts
 *
 * @constructor
 */
function TreelikeTable(opts) {
  // 数据来源链接
  this.url = opts.url;
  // 表格显示列
  this.columns = opts.columns || [];
  // 固定的请求参数
  this.data = opts.data || {};

  this.fieldName = opts.fields.name;
  this.fieldId = opts.fields.id;
  this.fieldParentId = opts.fields.parentId;

  this.iconCollapse = '<i class="far fa-plus-square"></i>';
  this.iconExpand = '<i class="far fa-minus-square"></i>';
  this.iconLeaf = '<i class="fas fa-square"></i>';

  this.padding = 20;
}

/**
 * Gets table element as root.
 *
 * @returns {HTMLTableElement}
 */
TreelikeTable.prototype.root = function () {
  this.table = document.createElement('table');
  this.table.classList.add('table', 'table-hover', 'table-outline');
  let thead = document.createElement('thead');
  thead.classList.add('thead-light');
  let tr = document.createElement('tr');

  for (let i = 0; i < this.columns.length; i++) {
    let col = this.columns[i];
    let th = document.createElement('th');
    th.classList.add('text-center');
    th.textContent = col.title;
    tr.append(th);
  }
  thead.append(tr);

  let tbody = document.createElement('tbody');

  this.table.append(thead);
  this.table.append(tbody);
  return this.table;
};

TreelikeTable.prototype.request = function (params) {
  let self = this;
  for (let key in this.data) {
    params[key] = this.data[key];
  }
  xhr.post({
    url: this.url,
    data: params,
    success: function (resp) {
      let rows = resp.data;
      let tbody = self.container.querySelector('table tbody');
      tbody.innerHTML = '';

      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        self.addRow(row, true, 0);
      }
    }
  });
};

/**
 * Adds a row into table.
 *
 * @param row
 *        the row object in data array from server side
 *
 * @param show
 *        show or hide
 *
 * @param level
 *        the tree node level
 *
 * @private
 */
TreelikeTable.prototype.addRow = function (row, show, level) {
  let self = this;

  let text = row[this.fieldName];
  let id = row[this.fieldId];
  let parentId = row[this.fieldParentId];

  let tbody = this.container.querySelector('table tbody');
  let tr = document.createElement('tr');
  tr.classList.add(show ? 'show' : 'hide');
  tr.setAttribute("data-id", id);
  tr.setAttribute("data-parent-id", parentId ? parentId : '');

  let td = document.createElement('td');
  td.style.paddingLeft = this.padding * level + 'px';

  let a = document.createElement('a');
  a.classList.add('btn', 'btn-sm', 'btn-link');

  a.addEventListener('click', function(ev) {
    if (a.innerHTML == self.iconLeaf) return;

    let trs = tbody.querySelectorAll('tr');
    for (let i = 0; i < trs.length; i++) {
      let tr = trs[i];
      let parentId = tr.getAttribute('data-parent-id');
      if (id == parentId) {
        if (a.innerHTML == self.iconCollapse) {
          tr.classList.remove('hide');
          tr.classList.add('show');
        } else if (a.innerHTML == self.iconExpand) {
          self.hideRows(id);
        }
      }
    }
    if (a.innerHTML == self.iconCollapse) {
      a.innerHTML = self.iconExpand;
    } else {
      a.innerHTML = self.iconCollapse;
    }
  });

  if ((typeof row.children !== 'undefined') && row.children.length > 0) {
    a.innerHTML = this.iconCollapse;
  } else {
    a.innerHTML = self.iconLeaf;
  }
  td.append(a);
  td.append(text);
  tr.append(td);

  for (let i = 1; i < this.columns.length; i++) {
    let col = this.columns[i];
    td = document.createElement('td');
    col.display(row, td);
    tr.append(td);
  }
  tbody.append(tr);
  if (typeof row.children !== 'undefined') {
    for (let i = 0; i < row.children.length; i++) {
      this.addRow(row.children[i], false, level + 1);
    }
  }
};

TreelikeTable.prototype.hideRows = function (id) {
  let tbody = this.container.querySelector('table tbody');
  let trs = tbody.querySelectorAll('tr');
  for (let i = 0; i < trs.length; i++) {
    let tr = trs[i];
    let parentId = tr.getAttribute('data-parent-id');
    if (id == parentId) {
      tr.classList.remove('show');
      tr.classList.add('hide');
      let a = tr.querySelector('a');
      if (a.innerHTML == this.iconExpand) {
        a.innerHTML = this.iconCollapse;
      }
      this.hideRows(tr.getAttribute('data-id'));
    }
  }
};

/**
 * 在指定页面元素下渲染树表。
 *
 * @param containerId
 *        页面元素标识
 *
 * @param params
 *        数据链接请求参数
 */
TreelikeTable.prototype.render = function (containerId, params) {
  this.container = document.getElementById(containerId);
  this.container.innerHTML = '';
  this.container.append(this.root());
  this.request(params);
};