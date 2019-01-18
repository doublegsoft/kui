/**
 * 
 */
var ListView = function (opts) {
  // 远程数据源
  this.url = opts.url;

  this.limit = opts.limit || 10;
  this.boundedQuery = opts.boundedQuery || null;
  // 修饰列模型数据
  this.decorateFunction = opts.decorateFunction;
  this.containerId = opts.containerId;
  this.templateId = opts.templateId;

  this.afterLoad = opts.afterLoad || function (obj) {};
  
  this.filters = {};
  this.start = 0;

  this.total = 0;
  this.list = null;
  this.result = null;

};

/**
 * Turns to the previous page.
 */
ListView.prototype.prev = function () {
  if (this.start <= 0)
    return;
  this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
ListView.prototype.next = function () {
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
ListView.prototype.go = function (page, criteria) {
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
ListView.prototype.render = function (containerId, params) {
  if (typeof this.contaienrId === 'undefined') this.containerId = containerId;
  var cntr = $('#' + this.containerId);
  cntr.empty();
  cntr.append(this.root(params)).append(this.pagination());
  if (typeof params === "undefined" || params == '' || params == '{}') {
    this.go(1);
  } else if (typeof params === 'object') {
    for (k in params) {
      this.addFilter(k, params[k]);
    }
    this.request({});
  } else {
    var ps = $.parseJSON(params);
    this.request(ps);
  }
};

/**
 * Gets the html source for this pagination table object.
 *
 * @return {object} the jquery table
 */
ListView.prototype.root = function (initParams) {
  if (typeof initParams === "undefined") {
    initParams = {};
  }
  var ret = $('<div>');
  ret.css('overflow-y', 'auto');
  this.list = $('<div></div>');
  if (typeof this.width !== 'undefined') this.list.css('width', this.width);
  if (typeof this.height !== 'undefined') ret.css('height', this.height);

  this.list.addClass("list-group");  
  ret.append(this.list);
  return ret;
};


/**
 * Builds pagination bar for table.
 * 
 * @return {object} a pagination bar, the jquery div.
 */
ListView.prototype.pagination = function () {
  if (this.limit <= 0) {
    return;
  }
  var self = this;
  var div = $('<div></div>');
  div.css('float', 'right');
  div.css('margin', '8px');
  var ul = $('<ul></ul>');
  ul.addClass('pagination');
  this.firstPage = $('<li></li>');
  var a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('首页');
  a.on('click', function () {
    self.go(1);
  });
  this.firstPage.append(a);

  if (this.style === 'full') {
    ul.append(this.firstPage);
  }

  this.prevPage = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('上一页');
  a.on('click', function () {
    self.prev();
  });
  this.prevPage.append(a);
  ul.append(this.prevPage);

  li = $('<li></li>');
  li.addClass('disabled');
  this.pagebar = $('<a></a>');
  this.pagebar.attr('href', 'javascript:void(0)');
  this.pagebar.attr('style', 'cursor: default');
  this.pagebar.text("0/0");
  li.append(this.pagebar);
  ul.append(li);

  this.nextPage = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('下一页');
  a.on('click', function () {
    self.next();
  });
  this.nextPage.append(a);
  ul.append(this.nextPage);

  this.lastPage = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('末页');
  a.on('click', function () {
    self.go(self.lastPageNumber());
  });
  this.lastPage.append(a);
  if (this.style === 'full') {
    ul.append(this.lastPage);
  }

  li = $('<li class=disabled></li>');
  a = $('<a></a>');
  a.attr('style', 'cursor: default');

  this.pagenum = $('<input/>');
  this.pagenum.attr('size', 1);
  this.pagenum.attr('style', 'font-size: 11px; text-align: right; width: 25px; height: 20px;');
  if (this.style === 'full') {
    a.append(this.pagenum);
    li.append(a);
    ul.append(li);
  }

  li = $('<li></li>');
  a = $('<a></a>');
  a.attr('href', 'javascript:void(0)');
  a.text('跳转');
  a.on('click', function () {
    var str = self.pagenum.val();
    if (typeof str === 'undefined' || str === '')
      return;
    // remove whitespace
    str = str.replace(/^\s+|\s+$/g, '');
    if (str === '')
      return;
    if (isNaN(self.pagenum.val()))
      return;
    var pn = parseInt(self.pagenum.val());
    if (pn < 0 || pn > self.lastPageNumber())
      return;
    self.go(pn);
  });

  if (this.style === 'full') {
    li.append(a);
    ul.append(li);
  }

  if (this.style === 'none') {
    return;
  }
  div.append(ul);
  return div;
};

/**
 * Shows the page number in the page bar and controls each link status.
 * 
 * @private
 */
ListView.prototype.showPageNumber = function () {
  var pagenum = this.start / this.limit + 1;
  var lastpagenum = this.lastPageNumber(),
    total = this.total;
  lastpagenum = lastpagenum ? lastpagenum : 0, total = total ? total : 0;
  if (this.limit <= 0) {
    return;
  }
  this.pagebar.html(pagenum + "/" + lastpagenum + "&nbsp;&nbsp;共" + total + "条记录");
  this.firstPage.removeClass();
  this.prevPage.removeClass();
  this.nextPage.removeClass();
  this.lastPage.removeClass();
  if (pagenum == 1) {
    this.firstPage.addClass('disabled');
    this.prevPage.addClass('disabled');
  }
  if (pagenum == this.lastPageNumber()) {
    this.nextPage.addClass('disabled');
    this.lastPage.addClass('disabled');
  }
};

ListView.prototype.disablePaging = function () {
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
ListView.prototype.lastPageNumber = function () {
  if (this.total == 0 || this.limit == -1) {
    return 1;
  }
  var residue = this.total % this.limit;
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
ListView.prototype.maxColSpan = function (column) {
  var ret = 1;
  var max = 0;
  for (var i = 0; column.children && i < column.children.length; ++i) {
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
ListView.prototype.clear = function () {
  this.list.empty();
};

/**
 * 
 */
ListView.prototype.request = function (others) {
  var self = this;
  var params = {};
  if (self.boundedQuery != null) {
    var ft = self.boundedQuery.formdata();
    for (var k in ft) {
      this.filters[k] = ft[k];
    }
  }
  if (typeof others !== "undefined") {
    for (var k in others) {
      if (k == "start") {
        this.start = parseInt(others[k])
      } else if (k == "limit") {
        this.limit = parseInt(others[k]);
      } else {
        this.filters[k] = others[k];
      }
    }
  }
  for (var k in this.filters) {
    params[k] = this.filters[k];
  }
  params['start'] = this.start;
  params['limit'] = this.limit;
  for (var k in this.filters) {
    params[k] = this.filters[k];
  }
  // params['criteria'] = JSON.stringify(this.filters);
  // this.setCookie();
  if (typeof this.url !== "undefined") {
    $.ajax({
      url: this.url,
      type: 'POST',
      data: params,
      success: function (resp) {
        var result;
        if (typeof resp === "string") {
          result = $.parseJSON(resp);
        } else {
          result = resp;
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

ListView.prototype.addFilter = function (name, value) {
  this.filters[name] = value;
};

ListView.prototype.clearFilters = function () {
  this.filters = {};
};

ListView.prototype.replace = function (str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
};

/**
 * Fills the table with the result.
 * 
 * @param the result from the server side
 */
ListView.prototype.fill = function (result) {
  this.clear();
  var mappingColumns = this.mappingColumns;
  if (result.data && result.data[0]) {
    var limit = this.limit;
    limit = limit < 0 ? result.data.length : limit;
    var tbody = $(this.list.find('tbody'));
    if (typeof this.tbodyHeight !== 'undefined') {
      tbody.css('height', this.tbodyHeight);
      tbody.css('overflow-y', 'auto');
    }
    for (var i = 0; i < limit; ++i) {
      var a = $('<a href="#" class="list-group-item list-group-item-action"></a>')
      var item = $('<div class="d-flex w-100 justify-content-between"></div>');
      a.append(item);
      if (i < result.data.length) {
        var row = result.data[i];
        this.decorateFunction(row);
        var source = document.getElementById(this.templateId).innerHTML;
        var template = Handlebars.compile(source);
        var html = template(row);
        item.html(html);
        this.list.append(a);
      }
    }
  }
};