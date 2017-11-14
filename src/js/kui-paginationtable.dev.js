/**
 * 
 */
var PaginationTable = function(opts) {
	// 远程数据源
    this.url = opts.url;
    // 本地数据源，未封装的数据源
    this.local = opts.local;
    if (typeof opts.local !== "undefined") {
    	this.local = {};
    	this.local.total = opts.local.length;
    	this.local.data = opts.local;
    }
    this.limit = opts.limit || 25;
    this.cache = opts.cache || "server";
    this.style = opts.style || "full";
    
    // 高度和宽度，用来固定表头和列的参数
    this.width = opts.width;
    this.height = opts.height;
    this.tbodyHeight = opts.tbodyHeight;
    
    // 冻结的列数量，基于零开始冻结
    this.frozenColumnCount = opts.frozenColumnCount || 0;
    this.frozenHeader = opts.frozenHeader || false;
    this.columnHeight = opts.columnHeight || '32px';
    
    this.boundedQuery = opts.boundedQuery || null;
    this.fixedColumns = opts.fixedColumn || 0;
    //是否只显示获取的数据长度对应的表格行数
    this.showDataRowLength = opts.showDataRowLength || false;
    this.containerId = opts.containerId;

    if (typeof opts.useCookie === "undefined") {
        this.useCookie = false;
    } else {
        this.useCookie = opts.useCookie;
    }
    this.afterLoad = opts.afterLoad || function(obj) {
    };
    /**
     * [{ title: "", children: [], template: "<a href='${where}'>${displayName}</a>", params: {where: "", displayName:
     * "default"} rowspan: 1 }]
     */
    this.columns = opts.columns || []; //所有一级列数量
    this.allcolumns = 0; //所有的列数量（包含了嵌套列)）
    this.columnMatrix = [];
    var max = 0;
    for (var i = 0; i < this.columns.length; ++i) {
        var col = this.columns[i];
        max = Math.max(max, (col.rowspan || 1));
        if(typeof col.colspan != "undefined"){
            this.allcolumns += col.colspan;
        }else{
            this.allcolumns++;
        }
    }
    this.mappingColumns = [];
    this.filters = {};
    this.headRowCount = max;
    this.start = 0;
    this.rollbackStart = 0;
    this.total = 0;
    this.table = null;
    this.result = null;
    for (var i = 0; i < max; ++i) {
        this.columnMatrix.push([]);
    }
    this.buildMatrix(this.columns, 0);
    this.buildMappingColumns(this.columns);

    this.rotateconfig = {
        len: 25, //图像每次旋转的角度
        brushtm: 70, //旋转的间隙时间
        maxptnum: 10, //提示文字后面.的最长数量
        textcololor: "#629BA0"
    }
};

/**
 * Turns to the previous page.
 */
PaginationTable.prototype.prev = function() {
    if (this.start <= 0)
        return;
    this.go((this.start - this.limit) / this.limit + 1);
};

/**
 * Turns to the next page.
 */
PaginationTable.prototype.next = function() {
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
PaginationTable.prototype.go = function(page, criteria) {
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
PaginationTable.prototype.render = function(containerId, params) {
    if (typeof this.contaienrId === 'undefined') this.containerId = containerId;
    var cntr = $('#' + this.containerId);
    cntr.empty();
    cntr.append(this.root(params)).append(this.pagination());
    if (typeof params === "undefined" || params == '' || params == '{}') {
	    // this.beforeRequest();
	    this.go(1);
	    this.afterRequest();
    } else if (typeof params === 'object') {
        for (k in params) {
            this.addFilter(k, params[k]);
        }
        this.request({});
    } else {
    	var ps = $.parseJSON(params);
    	// this.beforeRequest(ps);
    	this.request(ps);
    	this.afterRequest();
    }
};

PaginationTable.prototype.beforeRequest = function (initParams) {
    var _this = this;
    

    //var loadding = $("<h6> 正在加载数据，请稍候....</h6>");
    var loaddingct = $("<div></div>");
    loaddingct.attr("class","loaddingct");
    var loadding = $("<img/>");
    var loaddingtext= $("<h6>数据正在加载，请稍候</h6>");
    loaddingtext.css("color",_this.rotateconfig.textcololor);
    loaddingct.append(loaddingtext);
    var len = 0,ptnum=0;
    
    window.setInterval(function(){
        len += _this.rotateconfig.len;
        $("#"+loadding.attr("id")).css({
            '-webkit-transform' : "rotate(" + len +"deg)",
            '-moz-transform'    : "rotate(" + len +"deg)",
            '-ms-transform'     : "rotate(" + len +"deg)",
            '-o-transform'      : "rotate(" + len +"deg)",
            'transform'         : "rotate(" + len +"deg)",
        });

        if(ptnum++ < _this.rotateconfig.maxptnum )
            loaddingtext.html(loaddingtext.html()+".");
        else{
            ptnum = 0;
            loaddingtext.html("数据正在加载，请稍候");
        }
    }, _this.rotateconfig.brushtm);
    
    $(this.table.find('tbody')).append($("<tr></tr>").append($("<td></td>").attr("colspan",this.allcolumns).append(loaddingct)));
};

PaginationTable.prototype.afterRequest = function () {
	
};

PaginationTable.prototype.requestError = function () {
    this.table.find("div.loaddingct").html('<h6 style="color:red">数据加载出错，请联系管理员解决...</h6>');
};
/**
 * Gets the html source for this pagination table object.
 *
 * @return {object} the jquery table
 */
PaginationTable.prototype.root = function(initParams) {
	if (typeof initParams === "undefined") {
		initParams = {};
	}
	var ret = $('<div>');
	ret.css('overflow', 'auto');
    this.table = $("<table></table>");
    if (typeof this.width !== 'undefined') this.table.css('width', this.width);
    if (typeof this.height !== 'undefined') ret.css('height', this.height);
    // if (!this.frozenHeader) this.table.addClass('table');
    // this.table.addClass("table table-bordered table-striped");
    this.table.addClass("table table-responsive-sm table-hover table-outline mb-0");
    
    var self = this;
    var thead = $('<thead class="thead-light"></thead>');
    for (var i = 0; i < this.columnMatrix.length; ++i) {
        var tr = $("<tr></tr>");
        for (var j = 0; j < this.columnMatrix[i].length; ++j) {
        	var col = this.columnMatrix[i][j];
            var th = $('<th style="text-align: center"></th>');
            // 冻结列
            if (j < this.frozenColumnCount) th.addClass('headcol');
            var span = $("<span class='pull-right glyphicon glyphicon-sort'></span>");
            span.css("opacity", "0.3");
            span.on("click", function(evt) {
            	var sorting = "asc";
            	var span = $(evt.target);
            	if (span.hasClass("glyphicon-sort")) {
            		span.removeClass("glyphicon-sort");
            		span.addClass("glyphicon-sort-by-attributes");
            		span.css("opacity", "0.6");
            		sorting = "asc";
            	} else if (span.hasClass("glyphicon-sort-by-attributes")) {
            		span.removeClass("glyphicon-sort-by-attributes");
            		span.addClass("glyphicon-sort-by-attributes-alt");
            		sorting = "desc";
            	} else if (span.hasClass("glyphicon-sort-by-attributes-alt")) {
            		span.removeClass("glyphicon-sort-by-attributes-alt");
            		span.addClass("glyphicon-sort-by-attributes");
            		sorting = "asc";
            	}
            	// 其余的重置
            	if (!span.hasClass("glyphicon-sort")) {
            		self.table.find("th span").each(function (idx, elm) {
            			if (span.attr("data-order") == $(elm).attr("data-order")) return;
            			$(elm).removeClass("glyphicon-sort-by-attributes");
            			$(elm).removeClass("glyphicon-sort-by-attributes-alt");
            			$(elm).addClass("glyphicon-sort");
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
            th.attr('style', col.style || "");
            // 如果设置了列宽
            if (typeof col.width !== 'undefined') th.css('width', col.width);
            // 当需要冻结表头
            if (this.frozenHeader == true) {
                thead.css('float', 'left');
                th.css('float', 'left');
            }
            // 默认居中
            th.css('text-align', 'center');
            if (typeof col.headerClick === "undefined") {
            	//th.text(col.title);
            	th.append(col.title);
            } else {
                var a = $('<a>');
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
            		span.removeClass("glyphicon-sort");
            		if (initParams["sorting"] === "asc") {
            			span.addClass("glyphicon-sort-by-attributes");
            		} else {
            			span.addClass("glyphicon-sort-by-attributes-alt");
            		}
            	}
            	th.append(span);
            }
            tr.append(th);
        }
        thead.append(tr);
    }
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
PaginationTable.prototype.pagination = function() {
	if (this.limit <= 0) {
		return;
	}
    var self = this;
    var div = $('<div></div>');
    div.css('float', 'right');
    div.css('margin', '0');
    var ul = $('<ul></ul>');
    ul.addClass('pagination');
    this.firstPage = $('<li></li>');
    var a = $('<a></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('首页');
    a.on('click', function() {
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
    a.on('click', function() {
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
    a.on('click', function() {
        self.next();
    });
    this.nextPage.append(a);
    ul.append(this.nextPage);

    this.lastPage = $('<li></li>');
    a = $('<a></a>');
    a.attr('href', 'javascript:void(0)');
    a.text('末页');
    a.on('click', function() {
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
    a.on('click', function() {
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
PaginationTable.prototype.showPageNumber = function() {
    var pagenum = this.start / this.limit + 1;
    var lastpagenum = this.lastPageNumber() , total = this.total;
    lastpagenum = lastpagenum ? lastpagenum : 0,total = total ? total : 0;
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

PaginationTable.prototype.disablePaging = function() {
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
PaginationTable.prototype.lastPageNumber = function() {
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
PaginationTable.prototype.maxColSpan = function(column) {
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
PaginationTable.prototype.clear = function() {
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
PaginationTable.prototype.buildMappingColumns = function(columns) {
    for (var i = 0; i < columns.length; i++) {
        var col = columns[i];
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
PaginationTable.prototype.buildMatrix = function(columns, index) {
    if (!columns)
        return;
    var currentIndex = index;

    // add column children
    for (var i = 0; i < columns.length; ++i) {
        var col = columns[i];
        if (col.children && col.children.length > 0) {
            col.colspan = col.colspan || 1;
            this.buildMatrix(col.children, index + 1);
        }
        this.columnMatrix[currentIndex].push(col);
    }
};

/**
 * 
 */
PaginationTable.prototype.request = function(others) {
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
    for ( var k in this.filters) {
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
	        success: function(resp) {
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
	        error: function(resp) {
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
	var result = {};
	result.total = this.local.total;
	result.data = [];
	for (var i = this.start; i < (this.start + this.limit); i++) {
		result.data.push(this.local.data[i] == null ? "&nbsp;" : this.local.data[i]);
	}
	this.fill(result);
	this.showPageNumber();
    this.afterLoad(result);
};

PaginationTable.prototype.addFilter = function(name, value) {
    this.filters[name] = value;
};

PaginationTable.prototype.clearFilters = function() {
    this.filters = {};
};

PaginationTable.prototype.replace = function(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
};

/**
 * Fills the table with the result.
 * 
 * @param the result from the server side
 */
PaginationTable.prototype.fill = function(result) {
    this.clear();
    var mappingColumns = this.mappingColumns;
    if(result.data && result.data[0]) {
    	var limit = this.limit;
    	limit = limit < 0 ? result.data.length : limit;
    	var tbody = $(this.table.find('tbody'));
    	if (typeof this.tbodyHeight !== 'undefined') {
    	    tbody.css('height', this.tbodyHeight);
    	    tbody.css('overflow-y', 'auto');
    	}
	    for (var i = 0; i < limit; ++i) {
	        var tr = $("<tr></tr>");
	        tr.css('height', this.columnHeight)
	        if (i < result.data.length) {
	            var row = result.data[i];
	            for (var j = 0; j < mappingColumns.length; ++j) {
	                var col = mappingColumns[j];
	                var td = $("<td></td>");
	                // 冻结列
	                if (j < this.frozenColumnCount) td.addClass('headcol');
	                if (col.style) {
	                    td.attr("style", col.style);
	                }else{
                        td.attr("style", "text-align: center; vertical-align:middle");
                    }
	                if (typeof col.width !== 'undefined') td.css('width', col.width);
	                if (this.frozenHeader == true) {
	                    tbody.css('float', 'left');
	                    td.css('float', 'left');
	                }
	                if (col.template) {
	                    var html = col.template.toString();
	                    for (k in row) {
                            row[k] = row[k] == null ? "" : row[k];
	                        html = this.replace(html, "\\{" + k + "\\}", row[k]);
	                    }
	                    if (html.indexOf('{') == 0 && html.indexOf('}') != -1) {
	                        html = '';
	                    }
	                    td.html(html);
	                }
	                if (col.displayFunction) {
	                    col.displayFunction(row, td, j);
	                }
	                tr.append(td);
	            }
	        } else {
	            if (this.limit <= 0) {
	                break;
	            }
	            for (var j = 0; j < mappingColumns.length; ++j) {
	                var td = $("<td>&nbsp;</td>");
	                tr.append(td);
	            }
	        }
	        tbody.append(tr);
	    }
    }

};
