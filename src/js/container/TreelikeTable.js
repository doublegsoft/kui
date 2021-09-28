
/**
 *
 * @param opts
 *
 * @constructor
 */
function TreelikeTable(opts) {
  let self = this;
  // 数据来源链接
  if (typeof opts.url === 'object') {
    this.url = opts.url.root;
    this.urlChild = opts.url.child;
  } else {
    this.url = opts.url;
  }
  if (typeof opts.usecase === 'object') {
    this.usecase = opts.usecase.root;
    this.usecaseChild = opts.usecase.child;
  } else {
    this.usecase = opts.usecase;
  }

  this.filters = opts.params || opts.filters || {};
  this.filters.root = this.filters['root'] || {};
  this.filters.child = this.filters['child'] || {};
  // 表格显示列
  this.columns = opts.columns || [];
  // 固定的请求参数
  this.data = opts.data || opts.params || {};

  this.start = opts.start || 0;

  // the default is no pagination
  this.limit = opts.limit || -1;

  // unlimited tree node levels
  this.levels = opts.levels || -1;

  this.fieldName = opts.fields.name;
  this.fieldId = opts.fields.id;
  this.fieldParentId = opts.fields.parentId;
  this.fieldChildName = opts.fields.childName;

  this.iconCollapse = '<i class="far fa-plus-square"></i>';
  this.iconExpand = '<i class="far fa-minus-square"></i>';
  this.iconLeaf = '<i class="far" style="padding-right: 12px;"></i>';
  this.iconLoading = '<i class="fa fa-spinner fa-spin"></i>';

  this.padding = 20;

  // 绑定查询
  this.queryId = opts.queryId || null;
  if (opts.filter) {
    opts.filter.query = {
      callback: function(params) {
        self.go(1, params);
      }
    };
    // this.widgetFilter = new QueryLayout(opts.filter);
    opts.filter.table = this;
    this.queryFilter = new QueryFilter(opts.filter);
  }
}

/**
 * Gets table element as root.
 *
 * @returns {HTMLTableElement}
 */
TreelikeTable.prototype.root = function () {
  this.table = document.createElement('table');
  // 'table-outline',
  this.table.classList.add('table', 'table-hover', 'table-outline', 'mb-0');
  let thead = document.createElement('thead');
  thead.classList.add('thead-light');
  thead.style.height = '43px';
  let tr = document.createElement('tr');

  for (let i = 0; i < this.columns.length; i++) {
    let col = this.columns[i];
    let th = document.createElement('th');
    th.classList.add('text-center');
    if (col.style) {
      th.style = col.style;
    }
    th.style.verticalAlign = 'middle';
    // th.style.position = 'sticky';
    // th.style.zIndex = '900';
    th.style.top = '35px';
    th.textContent = col.title;
    tr.append(th);
  }
  thead.append(tr);

  let tbody = document.createElement('tbody');

  this.table.append(thead);
  this.table.append(tbody);
  return this.table;
};

/**
 * Requests and fetches remote data.
 *
 * @param params
 *        the http parameters
 */
TreelikeTable.prototype.request = function (params) {
  let self = this;
  params = params || {};
  if (this.widgetFilter) {
    let queryParams = this.widgetFilter.getQuery();
    for (let k in queryParams) {
      params[k] = queryParams[k];
    }
  }
  if (this.queryFilter) {
    let queryParams = this.queryFilter.getValues();
    for (let k in queryParams) {
      params[k] = queryParams[k];
    }
  }
  // static parameters
  for (let k in this.filters['root']) {
    params[k] = this.filters['root'][k];
  }
  // for (let k in this.filters['child']) {
  //   if (params[k]) {
  //     params[k] += ' ' + this.filters['child'][k];
  //   } else {
  //     params[k] = this.filters['child'][k];
  //   }
  // }
  // dynamic parameters from programmers
  for (let key in this.data) {
    params[key] = this.data[key];
  }
  params['start'] = this.start;
  params['limit'] = this.limit;

  params.fieldId = this.fieldId;
  params.fieldParentId = this.fieldParentId;

  // dynamic parameters from user input
  if (this.queryId != null) {
    let querydata = $('#' + this.queryId).formdata();
    for (var k in querydata) {
      params[k] = querydata[k];
    }
  }

  xhr.post({
    url: this.url,
    usecase: this.usecase,
    data: params,
    success: function (resp) {
      self.total = resp.total;

      let rows = resp.data;
      if (!rows) return;
      let tbody = self.container.querySelector('table tbody');
      tbody.innerHTML = '';
      if (rows.length == 0) {
        tbody.innerHTML = ('' +
            '<tr class="no-hover">' +
            '  <td colspan="100" class="text-center pt-4">' +
            '    <img width="48" height="48" src="img/kui/nodata.png" class="mb-2" style="opacity: 40%;">' +
            '    <p style="opacity: 40%; color: black;">没有匹配的数据</p>' +
            '  </td>' +
            '</tr>');
        return;
      }
      self.showPageNumber();
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        self.addRow(null, null, row, true);
      }
    }
  });
};

/**
 * Fetches child data.
 *
 * @param params
 */
TreelikeTable.prototype.requestChildren = function (clicked, params) {
  let self = this;
  params = params || {};
  for (let key in this.data) {
    params[key] = this.data[key];
  }
  for (let k in this.filters['child']) {
    params[k] = this.filters['child'][k];
  }
  let url = this.urlChild ? this.urlChild : this.url;
  let usecase = this.usecaseChild ? this.usecaseChild : this.usecase;
  params.start = 0;
  params.limit = -1;
  let tr = dom.ancestor(clicked, 'tr');
  clicked.innerHTML = this.iconLoading;
  xhr.post({
    url: url,
    usecase: usecase,
    data: params,
    success: function (resp) {
      let rows = resp.data;
      let sibling = tr.nextSibling;
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        // 测试用
        row[self.fieldParentId] = params[self.fieldParentId];
        if (self.fieldChildName) {
          row[self.fieldName] = row[self.fieldChildName];
        }
        self.addRow(tr, sibling, row, true);
      }
      clicked.innerHTML = self.iconExpand;
    }
  });
};

/**
 * Adds a row into table.
 *
 * @param trParent
 *        the parent <b>tr</b> dom element
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
TreelikeTable.prototype.addRow = function (trParent, trParentSibling, row, show) {
  let level = 0;
  if (trParent != null) {
    level = parseInt(trParent.getAttribute('data-tree-node-level')) + 1;
  }
  let self = this;

  let text = row[this.fieldName];
  let id = row[this.fieldId];
  let parentId = row[this.fieldParentId];

  let tbody = this.container.querySelector('table tbody');
  let tr = document.createElement('tr');
  tr.classList.add(show ? 'show' : 'hide');
  tr.setAttribute('data-tree-node-id', id);
  tr.setAttribute('data-tree-node-parent-id', parentId ? parentId : '');
  tr.setAttribute('data-tree-node-level', level);

  let td = document.createElement('td');
  td.style.paddingLeft = this.padding * level + 'px';

  let a = document.createElement('a');
  a.classList.add('btn', 'btn-link');

  a.addEventListener('click', function(ev) {
    if (this.innerHTML == self.iconLeaf) return;

    let trs = tbody.querySelectorAll('tr');
    for (let i = 0; i < trs.length; i++) {
      let tr = trs[i];
      let parentId = tr.getAttribute('data-tree-node-parent-id');
      if (id == parentId) {
        if (this.innerHTML == self.iconCollapse) {
          tr.classList.remove('hide');
          tr.classList.add('show');
        } else if (this.innerHTML == self.iconExpand) {
          self.hideRows(dom.ancestor(this, 'tr'));
        }
      }
    }
    if (self.limit > 0 && a.innerHTML == self.iconCollapse && true /*TODO: CHECK CHILDREN*/) {
      let tr = dom.ancestor(this, 'tr');
      let params = {};
      params[self.fieldParentId] = tr.getAttribute('data-tree-node-id');
      self.requestChildren(this, params);
      return;
    }
    if (this.innerHTML == self.iconCollapse) {
      this.innerHTML = self.iconExpand;
    } else {
      this.innerHTML = self.iconCollapse;
    }
  });

  // allow lazy loading leaves
  if (this.limit > 0 || ((typeof row.children !== 'undefined') && row.children.length > 0)) {
    a.innerHTML = this.iconCollapse;
  } else {
    a.innerHTML = self.iconLeaf;
  }
  if (this.levels > 0 && this.levels <= (level + 1))
    a.innerHTML = self.iconLeaf;

  td.append(a);
  let strong = dom.create('strong');
  strong.textContent = text;
  td.append(strong);
  tr.append(td);

  for (let i = 1; i < this.columns.length; i++) {
    let col = this.columns[i];
    td = document.createElement('td');
    if (col.style)
      td.style = col.style;
    col.display(row, td);
    tr.append(td);
  }
  if (trParent != null) {
    tbody.insertBefore(tr, trParentSibling);
  } else {
    tbody.append(tr);
  }
  if (typeof row.children !== 'undefined') {
    let sibling = tr.nextSibling;
    for (let i = 0; i < row.children.length; i++) {
      this.addRow(tr, sibling, row.children[i], false);
    }
  }
};

TreelikeTable.prototype.hideRows = function (trParent) {
  let tbody = this.container.querySelector('table tbody');

  let levelParent = parseInt(trParent.getAttribute('data-tree-node-level'));
  let tr = trParent.nextSibling;

  while (tr != null) {
    let level = parseInt(tr.getAttribute('data-tree-node-level'));
    let curr = tr;
    tr = tr.nextSibling;
    if (level > levelParent) {
      if (this.limit > 0) {
        curr.remove();
      } else {
        curr.classList.remove('show');
        curr.classList.add('hide');
      }
    } else {
      break;
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
  if (typeof containerId === 'string') {
    this.container = document.querySelector(containerId);
  } else {
    this.container = containerId;
  }
  this.container.innerHTML = '';


  let table = this.root();
  this.container.appendChild(this.actionbar());
  this.container.appendChild(table);
  this.container.appendChild(this.pagination());
  let top = dom.top(this.container);
  // table.style.height = 'calc(100% - 20px - ' + top + 'px)';

  this.tbody = dom.find('tbody', this.container);
  this.tbodyPosition = this.tbody.getBoundingClientRect();

  params = params || {};
  this.request(params);
};

TreelikeTable.prototype.actionbar = function() {
  let self = this;
  let top = $('<div class="full-width d-flex overflow-hidden" style="height: 26px;"></div>');

  if (this.queryFilter) {
    top.append(this.queryFilter.getRoot());
  } else {
    top.append(dom.element('<div class="full-width"></div>'));
    // div.removeClass('d-flex');
  }

  let actions = top.get(0); // dom.create('div', 'card-header-actions', 'pt-0', 'pr-2');

  if (this.favourite) {
    let action = dom.element('' +
        '<a widget-id="toggleFavourite" class="card-header-action text-yellow">\n' +
        '  <i class="far fa-star position-relative font-16" style="top: 4px;"></i>\n' +
        '</a>');
    actions.appendChild(action);
    dom.bind(action, 'click', function() {
      let icon = dom.find('i', action);
      if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        self.go(1, {_favourite: 'true'});
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        self.go(1, {_favourite: 'false'});
      }
    });
  }

  if (this.widgetFilter) {
    let containerQuery = dom.create('div', 'card', 'widget-query', 'fade', 'fadeIn');
    this.widgetFilter.render(containerQuery);
    this.container.appendChild(containerQuery);

    let action = dom.element('' +
        '<a widget-id="toggleFilter" class="card-header-action text-primary">\n' +
        '  <i class="fas fa-filter position-relative" style="top: 4px;"></i>\n' +
        '</a>');
    dom.bind(action, 'click', function() {
      let query = containerQuery;
      if (query.classList.contains('show')) {
        query.classList.remove('show');
      } else {
        query.classList.add('show');
      }
    });
    // WARNING: REPLACE BY QUERY FILTER
    // actions.appendChild(action);

  }

  if (this.group) {
    let action = dom.element('' +
        '<a widget-id="toggleGroup" class="card-header-action">\n' +
        '  <i class="fas fa-bars"></i>\n' +
        '</a>');
    actions.appendChild(action);
  }

  if (this.sort) {
    let action = dom.element('' +
        '<a widget-id="toggleSort" class="card-header-action">\n' +
        '  <i class="fas fa-sort-amount-down-alt position-relative" style="top: 4px; font-size: 17px;"></i>\n' +
        '</a>');
    actions.appendChild(action);
  }

  let action = dom.element('' +
      '<a widget-id="toggleFilter" class="card-header-action text-primary ml-2">\n' +
      '  <i class="fas fa-sync-alt position-relative" style="top: 3px;"></i>\n' +
      '</a>');
  dom.bind(action, 'click', function () {
    self.request();
  });
  actions.appendChild(action);

  return top.get(0);
};

/**
 * Displays pagination bar on the bottom of table.
 */
TreelikeTable.prototype.pagination = function () {
  let self = this;
  let div = dom.create('div', 'full-width', 'd-flex');
  // div.style.position = 'sticky';
  div.style.top = '0';
  // div.style.zIndex = 900;
  div.style.backgroundColor = 'white';

  let ul = dom.create('ul', 'pagination', 'mb-0', 'mt-2');
  ul.style.marginLeft = 'auto';
  this.firstPage = dom.create('li', 'page-item');
  let a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '首页';
  a.innerHTML = '<i class="material-icons">first_page</i>';
  dom.bind(a, 'click', function() {
    self.go(1);
  });

  this.firstPage.appendChild(a);
  ul.appendChild(this.firstPage);

  this.prevPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '上一页';
  a.innerHTML = '<i class="material-icons">chevron_left</i>';
  dom.bind(a, 'click', function() {
    self.prev();
  });
  this.prevPage.appendChild(a);
  ul.appendChild(this.prevPage);

  li = dom.create('li', 'page-item', 'disabled');
  this.pagebar = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  this.pagebar.setAttribute('href', 'javascript:void(0)');
  this.pagebar.style.cursor = 'default';
  this.pagebar.style.height = '30px';
  this.pagebar.style.lineHeight = '30px';
  this.pagebar.style.paddingBottom = '0px';
  this.pagebar.innerText = "0/0";
  li.appendChild(this.pagebar);
  ul.appendChild(li);

  this.nextPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '下一页';
  a.innerHTML = '<i class="material-icons">chevron_right</i>';
  dom.bind(a, 'click', function () {
    self.next();
  });
  this.nextPage.appendChild(a);
  ul.appendChild(this.nextPage);

  this.lastPage = dom.create('li', 'page-item');
  a = dom.create('a', 'page-link', 'b-a-0', 'pt-0');
  a.setAttribute('href', 'javascript:void(0)');
  a.style.paddingBottom = '0px';
  // a.innerText = '末页';
  a.innerHTML = '<i class="material-icons">last_page</i>';
  dom.bind(a, 'click', function () {
    self.go(self.lastPageNumber());
  });
  this.lastPage.appendChild(a);
  ul.append(this.lastPage);

  if (this.limit > 0) {
    div.appendChild(ul);
  }
  return div;
};

/**
 * Gets last page number of result.
 *
 * @returns {number} the last page number
 */
TreelikeTable.prototype.lastPageNumber = function () {
  if (this.total == 0 || this.limit == -1) {
    return 1;
  }
  let remain = this.total % this.limit;
  if (remain == 0) {
    return parseInt(this.total / this.limit);
  } else {
    return parseInt(this.total / this.limit + 1);
  }
};

/**
 * Turns to the previous page.
 */
TreelikeTable.prototype.prev = function () {
  if (this.start <= 0)
    return;
  this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
TreelikeTable.prototype.next = function () {
  if (this.start + this.limit >= this.total)
    return;
  this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the specific number.
 *
 * @param {number} page
 *        the page number
 */
TreelikeTable.prototype.go = function (page, params) {
  if (page <= 0 || page > this.lastPageNumber())
    return;
  this.start = this.limit * (page - 1);
  this.request(params);
};

/**
 * Shows the page number in the page bar and controls each link status.
 *
 * @private
 */
TreelikeTable.prototype.showPageNumber = function () {
  let pagenum = this.start / this.limit + 1;
  let lastpagenum = this.lastPageNumber();
  let total = this.total;
  lastpagenum = lastpagenum ? lastpagenum : 0, total = total ? total : 0;
  if (this.limit <= 0) {
    return;
  }
  this.pagebar.innerHTML = pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录";
  this.firstPage.classList.remove('disabled');
  this.prevPage.classList.remove('disabled');
  this.nextPage.classList.remove('disabled');
  this.lastPage.classList.remove('disabled');
  if (pagenum == 1) {
    this.firstPage.classList.add('disabled');
    this.prevPage.classList.add('disabled');
  }
  if (pagenum == this.lastPageNumber()) {
    this.nextPage.classList.add('disabled');
    this.lastPage.classList.add('disabled');
  }
};

/**
 * Replaces a single row in table list.
 *
 * @param row
 *        the row data after saving
 *
 * @since 3.0
 */
TreelikeTable.prototype.replaceRow = function (row) {
  let rowId = row[this.fieldId];
  let tr = dom.find('tr[data-tree-node-id="' + rowId + '"]', this.container);
  if (tr == null) return false;
  for (let i = 0; i < this.columns.length; i++) {
    if (i == 0) {
      let td = dom.find('td:first-child', tr);
      let strong = dom.find('strong', td);
      strong.textContent = row[this.fieldName];
    } else {
      let td = dom.find('td:nth-child(' + (i + 1) + ')', tr);
      td.innerHTML = '';
      this.columns[i].display(row, td);
    }
  }
  return true;
};

TreelikeTable.prototype.getRowAt = function(x, y) {
  let position = this.tbody.getBoundingClientRect();
  let top = position.y - this.tbodyPosition.y;

  let ret = document.elementFromPoint(x, y + top + dom.top(this.container));
  return ret;
};