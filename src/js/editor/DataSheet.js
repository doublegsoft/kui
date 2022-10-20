
function DataSheet(opt) {
  // 输入的数据列
  // 每一列包括列标题、数据类型、默认值、占位符
  this.columns = opt.columns;
  this.columnCount = this.getColumnCount(this.columns);
  // 第一列的行标题
  this.rowHeaderWidth = opt.rowHeaderWidth || 150;
  this.rowHeaders = opt.rowHeaders;
  this.rowCount = this.getRowCount(this.rowHeaders);
  // 是否只读模式
  this.readonly = opt.readonly === true ? true : false;

  this.totalColumns = [];
  for (let i = 0; i < this.columns.length; i++) {
    let column = this.columns[i];
    if (column.totalable) {
      this.totalColumns.push(column);
    }
  }
  // 时间回调
  this.onCellClicked = opt.onCellClicked;
  this.onRowHeaderClicked = opt.onRowHeaderClicked;

  // 计算获得各项数据
  this.rowHeaderColumnCount = this.getRowHeaderColumnCount(this.rowHeaders);
  this.colHeaderColumnCount = this.getColumnHeaderColumnCount(this.columns);
  this.rowHeaderRowCount = this.getRowHeaderRowCount(this.rowHeaders);
  this.colHeaderRowCount = this.getColumnHeaderRowCount(this.columns);
  this.matrixColumn = [];
  this.matrixRowHeader = [];
  this.buildColumnMatrix(this.columns, this.matrixColumn, 0);
  this.buildRowHeaderMatrix(this.rowHeaders, this.matrixRowHeader, 0);
}

/**
 * 渲染基础的表格DOM。
 */
DataSheet.prototype.root = function(data) {
  data = data || {};
  let self = this;
  this.table = dom.create('table', 'table', 'table-bordered');
  let thead = dom.create('thead');
  this.tbody = dom.create('tbody');
  let tr = dom.create('tr');
  let th = dom.create('th');
  th.style.borderBottomWidth = '0';
  th.style.width = this.rowHeaderWidth + 'px';

  // tr.appendChild(th);
  thead.appendChild(tr);
  this.table.appendChild(thead);
  this.table.appendChild(this.tbody);

  for (let i = 0; i < this.columns.length; i++) {
    let column = this.columns[i];
    th = dom.create('th', 'text-center');
    th.style.borderBottomWidth = '0';
    th.innerHTML = column.title;
    tr.appendChild(th);
  }

  for (let i = 0; i < this.rowCount; i++) {
    let rowHeader = this.rowHeaders[i];
    let tr = dom.create('tr');
    let td = dom.create('td');
    td.innerHTML = rowHeader.title;
    td.style.fontWeight = 'bold';
    tr.appendChild(td);
    for (let j = 0; j < this.columnCount; j++) {
      let column = this.columns[j];
      td = dom.create('td');
      td.style.textAlign = 'right';
      td.style.padding = '6px 12px';
      // td.setAttribute('contenteditable', 'true');
      td.setAttribute('data-ds-format', column.format || '');
      td.setAttribute('data-ds-row', i);
      td.setAttribute('data-ds-column', j);
      td.addEventListener('focus', function() {

      });
      if (data[rowHeader.title] && data[rowHeader.title][column.title]) {
        td.innerHTML = data[rowHeader.title][column.title];
      } else {
        td.innerHTML = '';
      }
      td.addEventListener('keyup', function(ev) {
        let td = this;
        let rowIndex = parseInt(td.getAttribute('data-ds-row'));
        let columnIndex = parseInt(td.getAttribute('data-ds-column'));
        let triggered = null;
        if (ev.keyCode == 13 /* ENTER */) {
          triggered = td;
        } else if (ev.keyCode == 37 /* ARROW LEFT */) {
          if (columnIndex == 0 /* 已经是第一列了，无法再向左移动 */) return;
          triggered = self.getCell(rowIndex, columnIndex - 1);
        } else if (ev.keyCode == 38 /* ARROW UP */) {
          if (rowIndex == 0 /* 已经是第一行了，无法再向上移动 */) return;
          triggered = self.getCell(rowIndex - 1, columnIndex);
        } else if (ev.keyCode == 39 /* ARROW RIGHT */) {
          if (columnIndex == self.columnCount - 1 /* 已经是最后一列，无法再向右移动 */) return;
          triggered = self.getCell(rowIndex, columnIndex + 1);
        } else if (ev.keyCode == 40 /* ARROW DOWN */) {
          if (rowIndex == self.rowCount - 1 /* 已经是最后一行，无法再向下移动 */) return;
          triggered = self.getCell(rowIndex + 1, columnIndex);
        }
        self.totalize();
        if (triggered != null) {
          td.blur();
          triggered.focus();
          document.execCommand('selectAll',false,null)
        }
      });
      tr.appendChild(td);
    }
    this.tbody.appendChild(tr);
  }
  if (this.totalColumns.length > 0) {
    let tr = dom.create('tr');
    let td = dom.create('td');
    td.innerHTML = '合计';
    td.style.fontWeight = 'bold';
    tr.appendChild(td);
    for (let j = 0; j < this.columnCount; j++) {
      td = dom.create('td');
      tr.appendChild(td);
    }
    this.tbody.appendChild(tr);
  }
  this.totalize();
  return this.table;
};

DataSheet.prototype.getCell = function(rowIndex, columnIndex) {
  let tbody = dom.find('tbody', this.table);
  let ret = null;
  for (let i = 0; i < tbody.children.length; i++) {
    let tr = tbody.children[i];
    if (i == rowIndex) {
      for (let j = 1 /*行头去掉*/; j < tr.children.length; j++) {
        if (j - 1 == columnIndex) {
          ret = tr.children[j];
          break;
        }
      }
      break;
    }
  }
  return ret;
};

DataSheet.prototype.render = function(containerId, data) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  // this.container.appendChild(this.root(data));
  let table = dom.element(`
    <table class="table table-bordered">
      <thead></thead>
      <tbody></tbody>
    </table>
  `);
  let thead = dom.find('thead', table);
  let tbody = dom.find('tbody', table);
  let totalRowCount = this.rowHeaderRowCount + this.colHeaderRowCount;
  let trs = [];
  for (let i = 0; i < this.colHeaderRowCount; i++) {
    let tr = dom.create('tr');
    trs.push(tr);
    thead.appendChild(tr);
  }
  // for (let i = 0; i < this.rowHeaderColumnCount; i++) {
  //   let th = dom.create('th', 'text-center');
  //   th.style = 'border-bottom-width: 1px;';
  //   th.setAttribute('rowspan', this.colHeaderRowCount);
  //   trs[0].appendChild(th);
  // }
  for (let i = 0; i < this.colHeaderRowCount; i++) {
    let tr = trs[i];
    for (let j = 0; j < this.colHeaderColumnCount; j++) {
      let column = this.matrixColumn[i][j];
      if (column == null) continue;
      let th = dom.create('th', 'text-center');
      th.style = 'border-bottom-width: 1px;';
      th.setAttribute('colspan', this.getSpanColumnCount(column));
      th.innerHTML = column.title;
      tr.appendChild(th);
    }
  }
  for (let i = 0; i < this.rowHeaderRowCount; i++) {
    let tr = dom.create('tr');
    for (let j = 0; j < this.rowHeaderColumnCount; j++) {
      let rowHeader = this.matrixRowHeader[j][i];
      if (rowHeader == null) continue;
      let td = dom.create('td');
      td.style = 'vertical-align: middle;';
      td.setAttribute('rowspan', this.getSpanRowCount(rowHeader));
      td.innerHTML = '<strong>' + rowHeader.title + '</strong>';
      if (this.onRowHeaderClicked) {
        td.onclick = ev => {
          let tds = Array.prototype.slice.call(td.parentElement.children);
          this.onRowHeaderClicked(td, tds.indexOf(td));
        };
      }
      tr.appendChild(td);
    }
    // 补齐其余的单元格
    for (let j = 0; j < this.colHeaderColumnCount - this.rowHeaderColumnCount; j++) {
      let td = dom.create('td');
      td.style.textAlign = 'right';
      td.style.padding = '6px 12px';
      // td.setAttribute('contenteditable', 'true');
      if (this.onCellClicked) {
        td.onclick = ev => {
          let tds = Array.prototype.slice.call(td.parentElement.children);
          this.onCellClicked(td, tds.indexOf(td));
        };
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  this.container.appendChild(table);
};

DataSheet.prototype.getValues = function() {
  let ret = {};
  for (let i = 0; i < this.rowHeaders.length; i++) {
    let rowHeader = this.rowHeaders[i];
    ret[rowHeader.title] = {};
    for (let j = 0; j < this.columns.length; j++) {
      let col = this.columns[j];
      ret[rowHeader.title][col.title]  = this.tbody.rows[i].cells[j + 1].innerText.trim();
    }
  }
  return ret;
};

DataSheet.prototype.totalize = function() {
  if (this.totalColumns.length == 0) return;
  let trTotal = this.tbody.children[this.tbody.children.length - 1];
  for (let i = 0; i < this.columns.length; i++) {
    let column = this.columns[i];
    if (column.totalable !== true) continue;
    let total = 0;
    let calculated = false;
    for (let j = 0; j < this.rowHeaders.length; j++) {
      let val = parseFloat(this.tbody.rows[j].cells[i + 1].innerText.trim());
      if (!isNaN(val)) {
        total += val;
        calculated = true;
      }
    }
    if (!isNaN(total) && calculated === true) {
      trTotal.cells[i + 1].innerText = total.toFixed(2);
    }
  }
};

DataSheet.prototype.buildColumnMatrix = function (columns, matrix, rowIndex) {
  if (!columns) return;
  let row;
  if (matrix[rowIndex]) {
    row = matrix[rowIndex];
  } else {
    row = [];
    matrix.push(row);
  }
  for (let i = 0; i < columns.length; i++) {
    let column = columns[i];
    row.push(column);
    let span = this.getSpanColumnCount(column);
    for (let j = 1; j < span; j++) {
      row.push(null);
    }
    this.buildColumnMatrix(column.children, matrix, rowIndex + 1);
  }
};

DataSheet.prototype.buildRowHeaderMatrix = function (rowHeaders, matrix, colIndex) {
  if (!rowHeaders) return;
  let row;
  if (matrix[colIndex]) {
    row = matrix[colIndex];
  } else {
    row = [];
    matrix.push(row);
  }
  for (let i = 0; i < rowHeaders.length; i++) {
    let rowHeader = rowHeaders[i];
    row.push(rowHeader);
    let span = this.getSpanRowCount(rowHeader);
    for (let j = 1; j < span; j++) {
      row.push(null);
    }
    this.buildRowHeaderMatrix(rowHeader.children, matrix, colIndex + 1);
  }
};

DataSheet.prototype.getSpanColumnCount = function (column) {
  let ret = 0;
  if (!column.children || column.children.length == 0) {
    return 1;
  }
  for (let i = 0; i < column.children.length; i++) {
    ret += this.getSpanColumnCount(column.children[i]);
  }
  return ret;
};

DataSheet.prototype.getSpanRowCount = function (rowHeader) {
  if (!rowHeader.children || rowHeader.children.length == 0) {
    return 1;
  }
  return rowHeader.children.length;
};

DataSheet.prototype.getRowCount = function(rowHeaders) {
  let ret = 0;
  for (let i = 0; i < rowHeaders.length; i++) {
    let rowHeader = rowHeaders[i];
    ret += 1;
    if (rowHeader.children) {
      ret += this.getRowCount(rowHeader.children);
    }
  }
  return ret;
};

DataSheet.prototype.getColumnCount = function(columns) {
  let ret = 0;
  for (let i = 0; i < columns.length; i++) {
    let column = columns[i];
    ret += 1;
    if (column.children) {
      ret += this.getColumnCount(column.children);
    }
  }
  return ret;
};

DataSheet.prototype.getColumnHeaderRowCount = function(columns) {
  let ret = 1;
  for (let i = 0; i < columns.length; i++) {
    let level = 1;
    let column = columns[i];
    if (column.children) {
      level += this.getColumnHeaderRowCount(column.children);
    }
    if (level > ret)
      ret = level;
  }
  return ret;
};

DataSheet.prototype.getRowHeaderRowCount = function(rowHeaders) {
  let ret = 0;
  for (let i = 0; i < rowHeaders.length; i++) {
    let rowHeader = rowHeaders[i];
    if (rowHeader.children) {
      ret += this.getRowHeaderRowCount(rowHeader.children);
    } else {
      ret += 1;
    }
  }
  return ret;
};

DataSheet.prototype.getColumnHeaderColumnCount = function(columns) {
  let ret = 0;
  for (let i = 0; i < columns.length; i++) {
    let column = columns[i];
    if (column.children) {
      ret += this.getColumnHeaderColumnCount(column.children);
    } else {
      ret += 1;
    }
  }
  return ret;
};

DataSheet.prototype.getRowHeaderColumnCount = function(rowHeaders) {
  let ret = 1;
  for (let i = 0; i < rowHeaders.length; i++) {
    let level = 1;
    let rowHeader = rowHeaders[i];
    if (rowHeader.children) {
      level += this.getRowHeaderColumnCount(rowHeader.children);
    }
    if (level > ret)
      ret = level;
  }
  return ret;
};