
function TestSheet(opt) {
  // 输入的数据列
  // 每一列包括列标题、数据类型、默认值、占位符
  this.columns = opt.columns;
  this.columnCount = opt.columns.length;
  // 第一列的行标题
  this.rowHeaderWidth = opt.rowHeaderWidth || 150;
  this.rowHeaders = opt.rowHeaders;
  this.rowCount = opt.rowHeaders.length;
  // 是否只读模式
  this.readonly = opt.readonly === true ? true : false;

  this.totalColumns = [];
  for (let i = 0; i < this.columns.length; i++) {
    let column = this.columns[i];
    if (column.totalable) {
      this.totalColumns.push(column);
    }
  }
}

/**
 * 渲染基础的表格DOM。
 */
TestSheet.prototype.root = function(data) {
  data = data || {};
  let self = this;
  this.table = dom.create('table', 'table', 'table-bordered');
  let thead = dom.create('thead');
  this.tbody = dom.create('tbody');
  let tr = dom.create('tr');
  let th = dom.create('th');
  th.style.borderBottomWidth = '0';
  th.style.width = this.rowHeaderWidth + 'px';

  tr.appendChild(th);
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
      td.setAttribute('contenteditable', 'true');
      td.setAttribute('data-ts-format', column.format || '');
      td.setAttribute('data-ts-row', i);
      td.setAttribute('data-ts-column', j);
      td.addEventListener('focus', function() {

      });
      if (data[rowHeader.title] && data[rowHeader.title][column.title]) {
        td.innerHTML = data[rowHeader.title][column.title];
      } else {
        td.innerHTML = '';
      }
      td.addEventListener('keyup', function(ev) {
        let td = this;
        let rowIndex = parseInt(td.getAttribute('data-ts-row'));
        let columnIndex = parseInt(td.getAttribute('data-ts-column'));
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

TestSheet.prototype.getCell = function(rowIndex, columnIndex) {
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

TestSheet.prototype.render = function(containerId, data) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  this.container.appendChild(this.root(data));
};

TestSheet.prototype.getValues = function() {
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

TestSheet.prototype.totalize = function() {
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