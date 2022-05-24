

function WeeklyCalendar(opt) {
  this.initialDate = opt.initialDate;
  this.editable = opt.editable || false;
  this.droppable = opt.droppable || false;
  // 首列的标题
  this.columnTitle = opt.columnTitle || '';
  // 拖拽drop以后的回调函数，drop到的单元格和transferData
  this.onRenderDropped = opt.onRenderDropped || function (td, data) {};
  // 渲染单元格函数，
  this.onRenderCell = opt.onRenderCell || function (td, data, rowIndex, cellIndex) {};
  this.dateField = opt.dateField;
  this.datedData = opt.datedData || [];
  this.rowHeaders = opt.rowHeaders || [];
  // 定位行索引函数
  this.isMatchedCell = opt.isMatchedCell;
  this.onAddedToCell = opt.onAddedToCell || function (container, date, rowIndex, initial) {};
}

/**
 * 构造根元素。
 */
WeeklyCalendar.prototype.root = function () {
  let ret = dom.templatize(`
    <table class="table table-responsive-sm table-outline">
      <thead class="thead-light">
      <tr>
        <th style="width: 12.5%; text-align: center; vertical-align: middle;">{{columnTitle}}</th>
        <th style="width: 12.5%; text-align: center;">
          <div>周一</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周二</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周三</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周四</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周五</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周六</div>
          <div></div>
        </th>
        <th style="width: 12.5%; text-align: center;">
          <div>周日</div>
          <div></div>
        </th>
      </tr>
      </thead>
      <tbody></tbody>
    </table>
  `, this);
  let thead = dom.find('thead', ret);
  let dayOfWeek = this.initialDate.day();
  if (dayOfWeek == 0) dayOfWeek = 7; // 星期日
  let milliArray = [];
  for (let i = 1; i < thead.children[0].children.length; i++) {
    let th = thead.children[0].children[i];
    let date = moment(this.initialDate).add(i - dayOfWeek, 'days');
    th.children[1].innerHTML = date.format('MM月DD日');
    th.setAttribute('data-date', date.format('YYYY-MM-DD'));
    milliArray.push(date.format('YYYY-MM-DD'));
  }
  let tbody = dom.find('tbody', ret);
  for (let i = 0; i < this.rowHeaders.length; i++) {
    let rowHeader = this.rowHeaders[i];
    let tr = dom.create('tr');
    for (let j = 0; j < 8; j++) {
      let td = dom.create('td');
      if (rowHeader.data) {
        dom.model(td, rowHeader.data);
      }
      td.style.height = '64px';
      if (j == 0) {
        td.style = 'text-align: center; vertical-align: center;';
        td.innerHTML = rowHeader.title;
      } else {
        td.setAttribute('data-date', milliArray[j - 1]);
        let buttonAdd = dom.element(`
          <div class="d-flex full-width full-height">
            <a class="btn-link m-auto plus" style="display: none;">
              <i class="fas fa-plus-circle"></i>
            </a>
          </div>
        `);
        if (this.editable) {
          td.appendChild(buttonAdd);
          dom.bind(buttonAdd, 'mouseover', ev => {
            let button = dom.ancestor(ev.target, 'div');
            dom.find('a.plus', button).style.display = '';
          });
          dom.bind(buttonAdd, 'mouseout', ev => {
            let button = dom.ancestor(ev.target, 'div');
            dom.find('a.plus', button).style.display = 'none';
          });
          dom.bind(buttonAdd.children[0], 'click', ev => {
            let button = dom.ancestor(ev.target, 'a');
            let td = button.parentElement.parentElement;
            let date = td.getAttribute('data-date');
            let rowHeaderData = dom.model(td.parentElement.children[0]);
            this.onAddedToCell(td.children[0], date, rowHeaderData);
          });
        }
        let content = dom.element(`<div class="content"></div>`);
        if (this.editable) {
          td.insertBefore(content, buttonAdd);
        } else {
          td.appendChild(content);
        }
        //
        for (let m = 0; m < this.datedData.length; m++) {
          let row = this.datedData[m];
          let rowHeaderData = dom.model(tr);
          if (this.isMatchedCell(milliArray[j - 1], rowHeader.data, row)) {
            this.onAddedToCell(content, milliArray[j - 1], rowHeader.data, row);
            break;
          }
        }
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  return ret;
};

WeeklyCalendar.prototype.reload = function (initialDate, datedData) {
  this.initialDate = initialDate;
  this.datedData = datedData;
  this.render(this.container);
};

WeeklyCalendar.prototype.render = function (containerId) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  let root = this.root();
  this.container.appendChild(root);
};