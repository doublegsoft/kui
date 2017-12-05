/**
 * 构造函数。
 *
 * @param {object} option
 *          选项设置
 *
 * @constructor
 */
function StatisticsTable(option) {
    this.url = option.url;
    this.columns = option.columns;
    this.onDimensionChanged = option.onDimensionChanged;
}

/**
 * 继承分页表为父类型。
 *
 * @type {PaginationTable}
 */
StatisticsTable.prototype = new PaginationTable({});


StatisticsTable.prototype.render = function (containerId) {
    this.containerId = containerId;

    this.table = $('<table>');
    this.table.addClass('table table-responsive-sm table-hover table-outline mb-0');

    var thead = $('<thead class="thead-light">');
    var tr = $('<tr>');
    for (var i = 0; i < this.columns.length; i++) {
        var col = this.columns[i];
        var th = $('<th style="text-align: center">');
        if (col.dimensions) {
            var a = $('<a data-toggle="dropdown">');
            a.attr('id', this.containerId + '__' + col.title + '__dimensions');
            var span = $('<span>');
            span.addClass('fa fa-ellipsis-v');
            a.addClass('pull-right');
            a.css('cursor', 'pointer');
            a.append(span);

            var div = $('<div class="dropdown-menu">');
            div.attr('aria-labelledby', a.attr('id'));
            for (var j = 0; j < col.dimensions.length; j++) {
                var dim = col.dimensions[j];
                if (j == 0) {
                    th.text(dim.title);
                }
                div.append('<button class="dropdown-item" type="button">' + dim.title + '</button>');
            }
            th.append(a);
            th.append(div);
        } else {
            th.text(col.title);
        }
        tr.append(th);
    }
    thead.append(tr);
    this.table.append(thead);
    var container = $('#' + this.containerId);
    var params = {};
    var self = this;
    ajax.post(this.url, params, function () {
       container.empty();
       container.append(self.table);
    });
};