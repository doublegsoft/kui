/**
 *
 */
function CalendarTable(option) {
    var now = moment();
    this.year = option.year || now.year();
    this.month = option.month || now.month();
    // the moment object
    this.date = moment().year(this.year).month(this.month);
    
    this.columns = option.columns || [];
}

CalendarTable.prototype = new PaginationTable({});

CalendarTable.prototype.nextMonth = function () {
    this.date.add(1, 'months');
};

CalendarTable.prototype.prevMonth = function () {
    this.date.subtract(1, 'months');
};

CalendarTable.prototype.render = function (containerId) {
    this.containerId = containerId;
    var rowHeaders = [];
    var rowTailers = [];
    for (var i = 0; i < this.columns.length; i++) {
        var col = this.columns[i];
        if (col.rowHeader) rowHeaders.push(col);
        else rowTailers.push(col);
    }
    var days = this.date.daysInMonth();
    
    this.table = $("<table></table>");
    if (typeof this.width !== 'undefined') this.table.css('width', this.width);
    if (typeof this.height !== 'undefined') ret.css('height', this.height);
    // if (!this.frozenHeader) this.table.addClass('table');
    // this.table.addClass("table table-bordered table-striped");
    this.table.addClass("table table-responsive-sm table-hover table-outline mb-0");
    
    var self = this;
    var thead = $('<thead class="thead-light"></thead>');
    var tr = $('<tr>');
    thead.append(tr);
    for (var i = 0; i < rowHeaders.length; i++) {
        var th = $('<th>');
        th.text(rowHeaders[i].title);
        tr.append(th);
    }
    for (var i = 0; i < days; i++) {
        var th = $('<th>');
        th.text(i + 1);
        tr.append(th);
    }
    for (var i = 0; i < rowTailers.length; i++) {
        var th = $('<th>');
        th.text(rowTailers[i].title);
        tr.append(th);
    }
    this.table.append(thead);
    
    $('#' + this.containerId).empty();
    $('#' + this.containerId).append(this.table);
};