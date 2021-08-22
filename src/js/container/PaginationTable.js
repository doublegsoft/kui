/**
 * 分页表格显示组件。
 * <p>
 * 配置项包括:
 * <ul>
 *   <li>url: 数据源的提供链接</li>
 *   <li>local: 本地数据源，类型为对象数组</li>
 *   <li>limit: 单页显示数量，默认为15</li>
 *   <li>params: 固定的请求参数，类型为对象</li>
 *   <li>usecase: 用例名称，appbase框架的特殊参数</li>
 * </ul>
 *
 * @param {object} opts
 *        配置型
 */
function PaginationTable(opts) {
  let self = this;
  // 远程数据源
  this.url = opts.url;
  // 用例
  this.usecase = opts.usecase;
  this.refreshable = opts.refreshable !== false;
  if (typeof opts.resultFilters !== "undefined") {
    this.resultFilters=opts.resultFilters;
  }
  // 本地数据源，未封装的数据源
  this.local = opts.local;
  if (typeof opts.local !== "undefined") {
    this.local = {};
    this.local.total = opts.local.length;
    this.local.data = opts.local;
  }

  this.limit = opts.limit || 15;

  this.cache = opts.cache || "server";
  this.style = opts.style || "full";

  this.headless = opts.headless || false;
  if (typeof opts.hoverable !== 'undefined') {
    this.hoverable = opts.hoverable;
  } else {
    this.hoverable = true;
  }

  // 固定或者初始化查询条件
  this.filters = {};
  if (opts.filters) {
    for (let k in opts.filters) {
      this.filters[k] = opts.filters[k];
    }
  }
  if (opts.params) {
    for (let k in opts.params) {
      this.filters[k] = opts.params[k];
    }
  }

  this.showLoading = opts.showLoading || false;


  // 高度和宽度，用来固定表头和列的参数
  this.width = opts.width;
  this.height = opts.height;
  this.tbodyHeight = opts.tbodyHeight;

  this.queryId = opts.queryId || null;
  this.boundedQuery = opts.boundedQuery || null;
  
  /*!
  ** 报表需要小计、合计功能
  */
  this.groupField = opts.groupField;
  this.totalFields = opts.totalFields || [];

  //是否只显示获取的数据长度对应的表格行数
  this.showDataRowLength = opts.showDataRowLength || false;
  this.containerId = opts.containerId;

  if (typeof opts.useCookie === "undefined") {
    this.useCookie = false;
  } else {
    this.useCookie = opts.useCookie;
  }
  this.afterLoad = opts.afterLoad || function (obj) {};
  /**
   * [{ title: "", children: [], template: "<a href='${where}'>${displayName}</a>", params: {where: "", displayName:
   * "default"} rowspan: 1 }]
   */
  this.columns = opts.columns || []; //所有一级列数量
  this.allcolumns = 0; //所有的列数量（包含了嵌套列)）
  this.columnMatrix = [];
  let max = 0;
  for (let i = 0; i < this.columns.length; ++i) {
    let col = this.columns[i];
    max = Math.max(max, (col.rowspan || 1));
    if (typeof col.colspan != "undefined") {
      this.allcolumns += col.colspan;
    } else {
      this.allcolumns++;
    }
  }
  this.mappingColumns = [];
  this.headRowCount = max;
  this.start = 0;
  this.rollbackStart = 0;
  this.total = 0;
  this.table = null;
  this.result = null;
  for (let i = 0; i < max; ++i) {
    this.columnMatrix.push([]);
  }
  this.buildMatrix(this.columns, 0);
  this.buildMappingColumns(this.columns);

  // 改版后的功能按钮
  if (opts.filter) {
    opts.filter.query = {
      callback: function(params) {
        self.go(1, params);
      }
    };
    this.widgetFilter = new QueryLayout(opts.filter);
  }
  //新增额外的excess
  if(opts.excess){
    this.widgetExcess=opts.excess;
  }
  if (opts.sort) {
    opts.sort.local = opts.sort.fields;
    opts.sort.create = function(idx, row) {
      let ret = dom.element(`
        <div class="full-width" style="margin-top: -8px; margin-bottom: -8px">
          <span class="position-relative" style="top: 8px;">${row.title}</span>
          <a data-role="desc" class="btn text-gray float-right" data-model-name="${row.name}">
            <i class="fas fa-sort-amount-up"></i>
          </a>
          <a data-role="asc" class="btn text-gray float-right" data-model-name="${row.name}">
            <i class="fas fa-sort-amount-down-alt"></i>
          </a>
        </div>
      `);
      dom.bind(dom.find('a[data-role=asc]', ret), 'click', function() {
        let model = dom.model(this);
        self.request({
          _order_by: model.name + ' asc'
        });
      });
      dom.bind(dom.find('a[data-role=desc]', ret), 'click', function() {
        let model = dom.model(this);
        self.request({
          _order_by: model.name + ' desc'
        });
      });
      return ret;
    };
    this.widgetSort = new ListView(opts.sort);
  }
  this.group = opts.group;
};

/**
 * Turns to the previous page.
 */
PaginationTable.prototype.prev = function () {
  if (this.start <= 0)
    return;
  this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
PaginationTable.prototype.next = function () {
  if (this.start + this.limit >= this.total)
    return;
  this.go((this.start + this.limit) / this.limit + 1);
};

/**
 * Goes to the given page.
 * 
 * @param {integer}
 *            page - the page number
 */
PaginationTable.prototype.go = function (page, criteria) {
  if (page <= 0 || page > this.lastPageNumber())
    return;
  this.rollbackStart = this.start;
  this.start = this.limit * (page - 1);
  // this.disablePaging();
  this.request(criteria);
};

/**
 * Renders the table in the web brower.
 * 
 * @param {string}
 *            containerId - the container id in the dom.
 */
PaginationTable.prototype.render = function (containerId, params) {
  if (typeof this.containerId === 'undefined') this.containerId = containerId;
  if (this.queryId != null) {
    this.boundedQuery = $('#' + this.queryId);
  }

  if (typeof this.containerId === 'string') {
    if (this.containerId.indexOf('#') == 0) {
      this.container = document.querySelector(this.containerId);
    } else {
      this.container = document.getElementById(this.containerId);
    }
  } else {
    this.container = containerId;
  }
  $(this.container).empty();  //tableTopActions
  $(this.container).append(this.tableTopActions(params));
  if(this.widgetExcess){
    $(this.container).append(this.widgetExcess.template);
  }
  $(this.container).append(this.root(params)).append(this.pagination());
  if (typeof params === "undefined" || params == '' || params == '{}') {
    this.go(1);
    this.afterRequest();
  } else if (typeof params === 'object') {
    for (let k in params) {
      this.addFilter(k, params[k]);
    }
    this.request({});
  } else {
    let ps = $.parseJSON(params);
    this.request(ps);
    this.afterRequest();
  }
};

/**
 * 请求之前的加载动画显示。
 */
PaginationTable.prototype.beforeRequest = function () {
  let loading = '' +
      '<div class="sk-circle">\n' +
      '  <div class="sk-circle1 sk-child"></div>\n' +
      '  <div class="sk-circle2 sk-child"></div>\n' +
      '  <div class="sk-circle3 sk-child"></div>\n' +
      '  <div class="sk-circle4 sk-child"></div>\n' +
      '  <div class="sk-circle5 sk-child"></div>\n' +
      '  <div class="sk-circle6 sk-child"></div>\n' +
      '  <div class="sk-circle7 sk-child"></div>\n' +
      '  <div class="sk-circle8 sk-child"></div>\n' +
      '  <div class="sk-circle9 sk-child"></div>\n' +
      '  <div class="sk-circle10 sk-child"></div>\n' +
      '  <div class="sk-circle11 sk-child"></div>\n' +
      '  <div class="sk-circle12 sk-child"></div>\n' +
      '</div>'

  if (this.showLoading) {
    $(this.table.find('tbody')).empty();
    $(this.table.find('tbody')).append($("<tr></tr>").append($("<td style='text-align:center'></td>").attr("colspan", this.allcolumns).html(loading)));
  }
};

PaginationTable.prototype.afterRequest = function () {

};

PaginationTable.prototype.requestError = function () {
  this.table.find("div.loaddingct").html('<h6 style="color:#dc3545">数据加载出错，请联系管理员解决...</h6>');
};

/**
 * Gets the html source for this pagination table object.
 *
 * @return {object} the jquery table
 */
PaginationTable.prototype.root = function (initParams) {
  if (typeof initParams === "undefined") {
    initParams = {};
  }
  let ret = $('<div class="">');
  ret.css('overflow-y', 'auto');
  this.table = $("<table></table>");
  if (typeof this.width !== 'undefined') this.table.css('width', this.width);
  if (typeof this.height !== 'undefined') ret.css('height', this.height);
  // if (!this.frozenHeader) this.table.addClass('table');
  // this.table.addClass("table table-bordered table-striped");
  this.table.addClass("table table-responsive-sm table-outline mb-0");
  if (this.hoverable) {
    this.table.addClass('table-hover');
  }
  this.table.css('overflow', 'hidden');

  let self = this;
  let thead = $('<thead class="thead-light" style="height: 43px;"></thead>');
  for (let i = 0; i < this.columnMatrix.length; ++i) {
    let tr = $("<tr></tr>");
    for (let j = 0; j < this.columnMatrix[i].length; ++j) {
      let col = this.columnMatrix[i][j];
      let th = $('<th style="vertical-align: middle;z-index:900;"></th>');
      // 冻结列
      if (j < this.frozenColumnCount) th.addClass('headcol');
      let span = $("<span class='pull-right fa fa-arrows-v'></span>");
      span.css("opacity", "0.3");
      span.css('margin-top', '2px');
      span.addClass('fa');
      span.on("click", function (evt) {
        let sorting = "asc";
        let span = $(evt.target);
        if (span.hasClass("fa-arrows-v")) {
          span.removeClass("fa-arrows-v");
          span.addClass("fa-sort-amount-asc");
          span.css("opacity", "0.6");
          sorting = "asc";
        } else if (span.hasClass("fa-sort-amount-asc")) {
          span.removeClass("fa-sort-amount-asc");
          span.addClass("fa-sort-amount-desc");
          sorting = "desc";
        } else if (span.hasClass("fa-sort-amount-desc")) {
          span.removeClass("fa-sort-amount-desc");
          span.addClass("fa-sort-amount-asc");
          sorting = "asc";
        }
        // 其余的重置
        if (!span.hasClass("fa-arrows-v")) {
          self.table.find("th span").each(function (idx, elm) {
            if (span.attr("data-order") == $(elm).attr("data-order")) return;
            $(elm).removeClass("fa-sort-amount-asc");
            $(elm).removeClass("fa-sort-amount-desc");
            $(elm).addClass("fa-arrows-v");
            $(elm).css("opacity", "0.3");
          });
        }
        // 请求数据
        self.filters["orderBy"] = span.attr("data-order");
        self.filters["sorting"] = sorting;
        self.request();
      });
      th.attr('rowspan', col.rowspan || 1);
      th.attr('colspan', col.colspan || 1);
      // style
      // th.attr('style', col.style || "");
      // 如果设置了列宽
      if (typeof col.width !== 'undefined') th.css('width', col.width);
      // 当需要冻结表头
      if (this.frozenHeader == true) {
        thead.css('float', 'left');
        th.css('float', 'left');
      }
      // 默认居中
      if (col.style) {
        th.attr('style', th.style + ';' + col.style);
      } else {
        th.css('text-align', 'center');
      }
      if (typeof col.headerClick === "undefined") {
        //th.text(col.title);
        th.append(col.title);
      } else {
        let a = $('<a>');
        a.on('click', col.headerClick);
        th.append(a);
        a.css("cursor", "default");
        a.text(col.title);
      }
      // 如果定义了data-order属性，则添加
      if (typeof col.order !== "undefined") {
        span.attr("data-order", col.order);
        // 根据初始化的过滤条件中，显示图标
        if (col.order === initParams["orderBy"]) {
          span.removeClass("fa sort");
          if (initParams["sorting"] === "asc") {
            // span.addClass("glyphicon-sort-by-attributes");
            span.addClass('fa fa-sort-amount-asc')
          } else {
            // span.addClass("glyphicon-sort-by-attributes-alt");
            span.addClass('fa fa-sort-amount-desc')
          }
        }
        th.append(span);
      }
      tr.append(th);
    }
    thead.append(tr);
  }
  if (!this.headless)
    this.table.append(thead);
  // 添加个空的表体
  this.table.append('<tbody></tbody>');
  ret.append(this.table);
  return ret;
};


/**
 * Builds pagination bar for table.
 * 
 * @return {object} a pagination bar, the jquery div.
 */
PaginationTable.prototype.pagination = function () {
  let self = this;
  let div = $('<div class="table-pagination"></div>');
  let ul = $('<ul class="pagination mb-0 mt-2" style="float: right;"></ul>');
  // ul.addClass('pagination mb-0');
  this.firstPage = $('<li class="page-item"></li>');
  let a = $('<a class="page-link b-a-0 pt-0" style="padding-bottom: 2px;"></a>');
  a.attr('href', 'javascript:void(0)');
  // a.text('首页');
  a.html('<i class="material-icons">first_page</i>');
  a.on('click', function () {
    self.go(1);
  });
  this.firstPage.append(a);

  if (this.style === 'full') {
    ul.append(this.firstPage);
  }

  this.prevPage = $('<li class="page-item"></li>');
  a = $('<a class="page-link b-a-0 pt-0" style="padding-bottom: 2px;"></a>');
  a.attr('href', 'javascript:void(0)');
  // a.text('上一页');
  a.html('<i class="material-icons">chevron_left</i>');
  a.on('click', function () {
    self.prev();
  });
  this.prevPage.append(a);
  ul.append(this.prevPage);

  li = $('<li class="page-item disabled"></li>');
  li.addClass('disabled');
  this.pagebar = $('<a class="page-link b-a-0 pt-1" style="padding-bottom: 2px;"></a>');
  this.pagebar.attr('href', 'javascript:void(0)');
  this.pagebar.attr('style', 'cursor: default');
  this.pagebar.text("0/0");
  li.append(this.pagebar);
  ul.append(li);

  this.nextPage = $('<li class="page-item"></li>');
  a = $('<a class="page-link b-a-0 pt-0" style="padding-bottom: 2px;"></a>');
  a.attr('href', 'javascript:void(0)');
  // a.text('下一页');
  a.html('<i class="material-icons">chevron_right</i>');
  a.on('click', function () {
    self.next();
  });
  this.nextPage.append(a);
  ul.append(this.nextPage);

  this.lastPage = $('<li class="page-item"></li>');
  a = $('<a class="page-link b-a-0 pt-0"  style="padding-bottom: 2px;"></a>');
  a.attr('href', 'javascript:void(0)');
  // a.text('末页');
  a.html('<i class="material-icons">last_page</i>');
  a.on('click', function () {
    self.go(self.lastPageNumber());
  });
  this.lastPage.append(a);
  if (this.style === 'full') {
    ul.append(this.lastPage);
  }

  li = $('<li class="page-item disabled"></li>');
  a = $('<a class="page-link b-a-0 pt-0"></a>');
  a.attr('style', 'cursor: default');
  if (this.limit < 0) {
    ul.empty();
  }else{
    ul.css('height', '34.75px');
  }
  div.get(0).appendChild(ul.get(0));
  return div;
};
//表格过滤搜索
PaginationTable.prototype.tableTopActions= function () {
  let self = this;
  let div = $('<div class="full-width" style="height: 24px;"></div>');
  let actions = dom.create('div', 'card-header-actions', 'pt-0', 'pr-2');

  if (this.group) {
    let action = dom.element('' +
        '<a widget-id="toggleGroup" class="card-header-action text-primary">\n' +
        '  <i class="fas fa-bars"></i>\n' +
        '</a>');
    actions.appendChild(action);
  }

  if (this.widgetSort) {
    let containerSort = dom.create('div', 'card', 'widget-sort', 'fade', 'fadeIn');
    containerSort.zIndex = 9999;
    this.widgetSort.render(containerSort);
    this.container.appendChild(containerSort);

    let action = dom.element('' +
        '<a widget-id="toggleSort" class="card-header-action text-primary">\n' +
        '  <i class="fas fa-sort-amount-down-alt position-relative" style="top: 4px; font-size: 17px;"></i>\n' +
        '</a>');
    dom.bind(action, 'click', function() {
      if (containerSort.classList.contains('show')) {
        containerSort.classList.remove('show');
      } else {
        containerSort.classList.add('show');
      }
    });
    actions.appendChild(action);
  }

  if (this.widgetFilter) {
    // let containerQuery = dom.create('div', 'card', 'widget-query', 'fade', 'fadeIn');
    let containerQuery = dom.create('div', 'card', 'widget-query',);
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
    // actions.appendChild(action);
  }
  if (this.refreshable) {
    let action = dom.element('' +
        '<a widget-id="toggleFilter" class="card-header-action text-primary">\n' +
        '  <i class="fas fa-sync-alt position-relative" style="top: 3px;"></i>\n' +
        '</a>');
    dom.bind(action, 'click', function () {
      self.request();
    });
    actions.appendChild(action);
  }
  div.get(0).appendChild(actions);

  // if (this.limit < 0) {
  //   ul.empty();
  //   if (this.widgetFilter)
  //     ul.css('height', '34.75px');
  // }
  // div.get(0).appendChild(ul.get(0));

  return div;
}
/**
 * Shows the page number in the page bar and controls each link status.
 * 
 * @private
 */
PaginationTable.prototype.showPageNumber = function () {
  let pagenum = this.start / this.limit + 1;
  let lastpagenum = this.lastPageNumber(),
    total = this.total;
  lastpagenum = lastpagenum ? lastpagenum : 0, total = total ? total : 0;
  if (this.limit <= 0) {
    return;
  }
  this.pagebar.html(pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录");
  if (total == 0 || this.lastPageNumber() == 1) {
    this.firstPage.addClass('disabled');
    this.prevPage.addClass('disabled');
    this.nextPage.addClass('disabled');
    this.lastPage.addClass('disabled');
    return;
  }
  if (pagenum == 1) {
    this.firstPage.addClass('disabled');
    this.prevPage.addClass('disabled');
    this.nextPage.removeClass('disabled');
    this.lastPage.removeClass('disabled');
  } else if (pagenum == this.lastPageNumber()) {
    this.nextPage.addClass('disabled');
    this.lastPage.addClass('disabled');
    this.firstPage.removeClass('disabled');
    this.prevPage.removeClass('disabled');
  } else {
    this.firstPage.removeClass('disabled');
    this.prevPage.removeClass('disabled');
    this.nextPage.removeClass('disabled');
    this.lastPage.removeClass('disabled');
  }
};

/**
 * 禁用逐个分页按钮。
 *
 * @private
 */
PaginationTable.prototype.disablePaging = function () {
  if (this.limit <= 0) {
    return;
  }
  this.firstPage.removeClass();
  this.prevPage.removeClass();
  this.nextPage.removeClass();
  this.lastPage.removeClass();
  this.firstPage.addClass('disabled');
  this.prevPage.addClass('disabled');
  this.nextPage.addClass('disabled');
  this.lastPage.addClass('disabled');
};

/**
 * Gets the last page number.
 * 
 * @return the last page number
 */
PaginationTable.prototype.lastPageNumber = function () {
  if (this.total == 0 || this.limit == -1) {
    return 1;
  }
  let residue = this.total % this.limit;
  if (residue == 0) {
    return parseInt(this.total / this.limit);
  } else {
    return parseInt(this.total / this.limit + 1);
  }
};

/**
 * Gets the max col span for the given column.
 * 
 * @param {object}
 *            column - the column object
 * 
 * @private
 */
PaginationTable.prototype.maxColSpan = function (column) {
  let ret = 1;
  let max = 0;
  for (let i = 0; column.children && i < column.children.length; ++i) {
    max = Math.max(max, this.maxColSpan(column.children[i]));
  }
  ret += max;
  return ret;
};

/**
 * Clears all data rows.
 * 
 * @private
 */
PaginationTable.prototype.clear = function () {
  // this.table.find("thead").remove(); // 如果手动添加了表格头部
  $(this.table.find('tbody')).empty();
};

/**
 * Builds the direct columns which are used to map values with result.
 * 
 * @param {array}
 *            columns - the columns
 * 
 * @private
 */
PaginationTable.prototype.buildMappingColumns = function (columns) {
  for (let i = 0; i < columns.length; i++) {
    let col = columns[i];
    if (!col.children || col.children.length == 0) {
      this.mappingColumns.push(col);
    } else {
      this.buildMappingColumns(col.children);
    }
  }
};

/**
 * Builds column matrix.
 * 
 * @param {object}
 *            parent - the parent column
 * 
 * @param {integer}
 *            index - the matrix row index
 * 
 * @private
 */
PaginationTable.prototype.buildMatrix = function (columns, index) {
  if (!columns)
    return;
  let currentIndex = index;

  // add column children
  for (let i = 0; i < columns.length; ++i) {
    let col = columns[i];
    if (col.children && col.children.length > 0) {
      col.colspan = col.colspan || 1;
      this.buildMatrix(col.children, index + 1);
    }
    this.columnMatrix[currentIndex].push(col);
  }
};

/**
 * 向服务器发起请求获取数据。
 *
 * @public
 */
PaginationTable.prototype.request = function (others) {
  let self = this;
  let params = {};
  if (self.boundedQuery != null) {
    let ft = self.boundedQuery.formdata();
    for (let k in ft) {
      this.filters[k] = ft[k];
    }
  }
  params = params || {};

  // the parameters from query for this table
  if (this.widgetFilter) {
    let queryParams = this.widgetFilter.getQuery();
    for (let k in queryParams) {
      params[k] = queryParams[k];
    }
  }

  // the parameters defined in table options
  for (let k in this.filters) {
    params[k] = this.filters[k];
  }

  // the parameters of method arguemnts
  if (typeof others !== "undefined") {
    for (let k in others) {
      if (k == "start") {
        this.start = parseInt(others[k])
      } else if (k == "limit") {
        this.limit = parseInt(others[k]);
      } else {
        params[k] = others[k];
      }
    }
  }
  params['start'] = this.start;
  params['limit'] = this.limit;

  // params['criteria'] = JSON.stringify(this.filters);
  // this.setCookie();
  if (typeof this.url !== "undefined") {
    this.beforeRequest();
    xhr.post({
      url: this.url,
      usecase: this.usecase,
      data: params,
      success: function (resp) {
        let result;
        if (typeof resp === "string") {
          result = $.parseJSON(resp);
        } else {
          result = resp;
        }
        if (!result.total) {
          result.total = 0;
          result.data = [];
        }
        if(self.resultFilters){
          result=self.resultFilters(result);
        }
        self.total = result.total;
        self.fill(result);
        self.showPageNumber();
        self.afterLoad(result);
      },
      error: function (resp) {
        self.start = self.rollbackStart;
        self.showPageNumber();
        self.requestError();
      }
    });
    return;
  }
  this.loadLocal();
};

/**
 * 加载本地数据分页显示。
 */
PaginationTable.prototype.loadLocal = function () {
  this.total = this.local.total;
  let result = {};
  result.total = this.local.total;
  result.data = [];
  for (let i = this.start; i < (this.start + this.limit) && i < this.local.total; i++) {
    result.data.push(this.local.data[i] == null ? "&nbsp;" : this.local.data[i]);
  }
  this.fill(result);
  this.showPageNumber();
  this.afterLoad(result);
};

PaginationTable.prototype.addFilter = function (name, value) {
  this.filters[name] = value;
};

PaginationTable.prototype.clearFilters = function () {
  this.filters = {};
};

PaginationTable.prototype.replace = function (str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
};

/**
 * Fills the table with the result.
 * 
 * @param the result from the server side
 * 
 * @version 3.0.0 - 增加表格的小计合计功能
 */
PaginationTable.prototype.fill = function (result) {
  this.clear();
  let self = this;

  function incrementTotalOrSubtotalColumns(totalRow, subtotalRow, rawRow) {
    for (let i = 0; i < self.totalFields.length; i++) {
      let rc = self.totalFields[i];
      let value = parseFloat(rawRow[rc]);
      if (isNaN(value)) {
        value = 0;
      }
      
      let totalValue = parseFloat(totalRow[rc]);
      if (isNaN(totalValue)) {
        totalValue = 0;
      }
      totalValue += value;
      totalRow[rc] = totalValue;
      
      if (subtotalRow) {
        let subtotalValue = parseFloat(subtotalRow[rc]);
        if (isNaN(subtotalValue)) {
          subtotalValue = 0;
        }
        subtotalValue += value;
        subtotalRow[rc] = subtotalValue;
      }
    }
  }
  
  //
  // 如果需要统计功能，则需要出现小计、合计列
  //
  let resultNew = {
    total: result.total,
    data: []
  };
  let previousGroupValue = null;
  let totalRow = {};
  let subtotalRow = {};
  for (let i = 0; i < result.data.length; i++) {
    if (this.totalFields.length == 0) {
      resultNew.data.push(result.data[i]);
      continue;
    }
    // 计算小计、合计
    let row = result.data[i];
    let groupValue = row[this.groupField];
    if (previousGroupValue == null) {
      previousGroupValue = groupValue;
    }
    if (groupValue != previousGroupValue) {
      previousGroupValue = groupValue;
      subtotalRow[this.mappingColumns[0].title] = '小计';
      
      resultNew.data.push(subtotalRow);
      resultNew.data.push(result.data[i]);
      
      subtotalRow = {};
      subtotalRow[this.mappingColumns[0].title] = '小计';
    } else {
      resultNew.data.push(result.data[i]);
    }
    incrementTotalOrSubtotalColumns(totalRow, subtotalRow, row);
  }
  // 判断小计行是否有值
  if (this.totalFields.length > 0) {
    subtotalRow[this.mappingColumns[0].title] = "小计";
    resultNew.data.push(subtotalRow);
  }
  if (this.totalFields.length > 0) {
    totalRow[this.mappingColumns[0].title] = "合计";
    resultNew.data.push(totalRow);
  }
  
  let mappingColumns = this.mappingColumns;
  if (resultNew.data && resultNew.data[0]) {
    let limit = this.limit;
    limit = limit < 0 ? resultNew.data.length : limit;
    let tbody = $(this.table.find('tbody'));
    if (typeof this.tbodyHeight !== 'undefined') {
      tbody.css('height', this.tbodyHeight);
      tbody.css('overflow-y', 'auto');
    }
    for (let i = 0; i < limit; ++i) {
      let tr = $("<tr></tr>");
      tr.css('height', this.columnHeight)
      if (i < resultNew.data.length) {
        let row = resultNew.data[i];
        for (let j = 0; j < mappingColumns.length; ++j) {
          let col = mappingColumns[j];
          let td = $("<td></td>");
          // 冻结列
          if (j < this.frozenColumnCount) td.addClass('headcol');
          if (col.style) {
            td.attr("style", col.style);
          } else {
            td.attr("style", "text-align: center; vertical-align:middle");
          }
          if (typeof col.width !== 'undefined') td.css('width', col.width);
          if (this.frozenHeader === true) {
            tbody.css('float', 'left');
            td.css('float', 'left');
          }
          if (col.template) {
            let html = col.template.toString();
            for (k in row) {
              row[k] = row[k] == null ? "-" : row[k];
              html = this.replace(html, "\\{" + k + "\\}", row[k]);
            }
            if (html.indexOf('{') == 0 && html.indexOf('}') != -1) {
              html = '-';
            }
            td.html(html);
          }
          if (col.display) {
            col.display(row, td.get(0), j, i, this.start);
          }
          tr.append(td);
        }
        tbody.append(tr);
      } // if (i < result.data.length)  
    }
  }else{
    let tbody = $(this.table.find('tbody'));
    if(tbody){
      tbody.append('' +
        '<tr class="no-hover">' +
        '  <td colspan="100" class="text-center pt-3">' +
        '    <img width="48" height="48" src="img/kui/nodata.png" class="mb-2" style="opacity: 40%;">' +
        '    <p>没有匹配的数据</p>' +
        '  </td>' +
        '</tr>');
    }else{
      this.table.append('' +
        '<tr class="no-hover">' +
        '  <td colspan="100" class="text-center pt-3">' +
        '    <img width="48" height="48" src="img/kui/nodata.png" class="mb-2" style="opacity: 40%;">' +
        '    <p>没有匹配的数据</p>' +
        '  </td>' +
        '</tr>');
    }
  }
};

/**
 * 通过stack方式显示单行额外信息。
 *
 * @param {integer} rowIndex
 *        扩展的行的索引号
 *
 * @param {string} url
 *        在stack区域显示的内容
 *
 * @param {function} render
 *        用于渲染stack区域的回调函数
 */
PaginationTable.prototype.stack = function(rowIndex, url, params, render) {
  params = params || {};
  let tbody = dom.find('tbody', this.container);
  let rowStack = tbody.children[rowIndex + 1];
  if (rowStack != null && rowStack.getAttribute('role') == 'stack') {
    return;
  }
  rowStack = dom.find('tr[role=stack]', tbody);

  if (rowStack != null) {
    if (rowStack.rowIndex <= rowIndex) rowIndex--;
    rowStack.remove();
  }
  let row = tbody.children[rowIndex];
  rowStack = dom.create('tr', 'fade', 'fadeInDown');
  rowStack.setAttribute('role', 'stack');
  // rowStack.setAttribute('style', 'background-color: white;')

  let cellStack = dom.create('td');
  rowStack.style.backgoundColor = 'white';
  cellStack.setAttribute('colspan', this.columns.length);
  rowStack.appendChild(cellStack);

  if (row == null || row.nextSibling == null) {
    tbody.appendChild(rowStack);
  } else {
    tbody.insertBefore(rowStack, row.nextSibling);
  }

  xhr.get({
    url: url,
    success: function(resp) {
      utils.append(cellStack, resp);
      if (render)
        render(cellStack, params);
      setTimeout(function () {
        rowStack.classList.add('show');
      }, 300);
    }
  })
};

PaginationTable.prototype.unstack = function() {
  let tbody = dom.find('tbody', this.container);
  let rowStack = dom.find('tr[role=stack]', tbody);
  if (rowStack != null) rowStack.remove();
};

/**
 *
 * @returns {Element}
 */
PaginationTable.skeleton = function() {
  return dom.element(`
    <table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="padding: 16px; /*position: sticky; top: 0px; z-index: 9999;*/">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
          </th>
          <th style="padding: 16px; /*position: sticky; top: 0px; z-index: 9999;*/">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
          </th>
          <th style="padding: 16px; /*position: sticky; top: 0px; z-index: 9999;*/">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-top: 1px solid rgba(0, 0, 0, 0.3);">
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
        </tr>
        <tr style="border-top: 1px solid rgba(0, 0, 0, 0.3);">
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
        </tr>
        <tr style="border-top: 1px solid rgba(0, 0, 0, 0.3);">
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
        </tr>
        <tr style="border-top: 1px solid rgba(0, 0, 0, 0.3);">
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
          <td style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
              <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
              <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
                <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  `);
};