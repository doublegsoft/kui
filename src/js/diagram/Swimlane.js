
function Swimlane(opt) {
  this.lanes = opt.lanes || [];
  this.shapes = [];
  this.padding = 10;
  this.gutter = 40;
  this.defaultWidth = 120;
  this.passed = opt.passed || [];

  this.colorSuccess = '#73b17b';
  this.colorFailed = '#d32f2f';
  this.colorDefault = '#333333';
}

Swimlane.prototype.draw = function() {
  const headSize = 36;

  // top-left corner
  this.context.beginPath();
  this.setColorContext(null);

  this.context.strokeWidth = 1;
  this.context.moveTo(this.padding, this.padding);
  this.context.lineTo(this.width - this.padding, this.padding);
  this.context.lineTo(this.width - this.padding, this.height - this.padding);
  this.context.lineTo(this.padding, this.height - this.padding);
  this.context.lineTo(this.padding, this.padding);
  this.context.stroke();

  this.context.moveTo(this.padding + headSize, this.padding);
  this.context.lineTo(this.padding + headSize, this.height - this.padding);
  this.context.stroke();
  this.context.closePath();

  let len = this.lanes.length;
  if (len == 0) return;

  this.laneHeight = (this.height - this.padding * 2) / len;

  this.context.font = 'bold 14px arial';
  const textPadding = 4;
  for (let i = 0; i < len; i++) {
    this.context.beginPath()
    this.setColorContext(null);
    let lane = this.lanes[i];
    this.context.moveTo(this.padding, this.padding + this.laneHeight * i);
    this.context.lineTo(this.width - this.padding, this.padding + this.laneHeight * i);
    this.context.stroke();

    let title = lane.title;
    let lineNo = Math.round(title.length / 2);
    let textY = this.padding + this.laneHeight * i + (this.laneHeight - lineNo * 18) / 2;
    // 渲染文本
    for (let j = 0; j < lineNo; j++) {
      this.context.fillText(lane.title.substring(j * 2, (j + 1) * 2),
        this.padding + textPadding, textY + (j + 1) * 18);
    }
    this.context.closePath();
    for (let j = 0; j < lane.actions.length; j++) {
      let action = lane.actions[j];
      if (action.type == 'PROC') {
        this.drawProcess(this.padding * 2 + headSize + this.gutter * j + this.defaultWidth * j, i, action)
      } else if (action.type == 'COND') {
        this.drawCondition(this.padding * 2 + headSize + this.gutter * j + this.defaultWidth * j, i, action);
      }
    }
  }
  this.drawConnections();
};

Swimlane.prototype.drawProcess = function(x, laneIndex, action) {
  let radius = 10;
  let text = action.name;
  let metrics = this.context.measureText(text);

  let width = 120;
  let height = 60;

  let y = this.laneHeight * laneIndex + (this.laneHeight - height) / 2 + this.padding;

  this.context.beginPath();
  this.setColorContext(action.id);

  this.context.moveTo(x + radius, y);
  this.context.lineTo(x + width - radius, y);
  this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.context.lineTo(x + width, y + height - radius);
  this.context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.context.lineTo(x + radius, y + height);
  this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.context.lineTo(x, y + radius);
  this.context.quadraticCurveTo(x, y, x + radius, y);
  this.context.stroke();

  let textX = x + (width - metrics.width) / 2;
  let textY = y + (height - 0) / 2;
  this.context.fillText(text, textX, textY);
  this.context.stroke();
  this.context.closePath();

  this.shapes.push({
    id: action.id,
    x: x,
    y: y,
    width: width,
    height: height,
    type: 'PROC',
  });
};

Swimlane.prototype.drawCondition = function(x, laneIndex, action) {
  let radius = 10;
  let text = action.name;
  let metrics = this.context.measureText(text);

  let width = 120;
  let height = 60;

  let y = this.laneHeight * laneIndex + (this.laneHeight - height) / 2 + this.padding;

  this.context.beginPath();
  this.setColorContext(action.id);
  // 从左侧开始画
  this.context.moveTo(x, y + height / 2);
  // 到顶部
  this.context.lineTo(x + width / 2, y);
  // 到右侧
  this.context.lineTo(x + width, y + height / 2);
  // 到底部
  this.context.lineTo(x + width / 2, y + height);
  // 再到左侧
  this.context.lineTo(x, y + height / 2);
  this.context.stroke();

  let textX = x + (width - metrics.width) / 2;
  let textY = y + (height - 0) / 2;
  this.context.fillText(text, textX, textY);
  this.context.stroke();
  this.context.closePath();

  this.shapes.push({
    id: action.id,
    x: x,
    y: y,
    width: width,
    height: height,
    type: 'COND',
  });
};

Swimlane.prototype.drawConnections = function () {
  for (let i = 0; i < this.lanes.length; i++) {
    let lane = this.lanes[i];
    for (let j = 0; j < lane.actions.length; j++) {
      let action = lane.actions[j];
      let next = action.next;
      let shape = this.getShape(action.id);
      if (typeof next === 'string') {
        let nextShape = this.getShape(next);
        this.drawConnection(shape, nextShape, '', this.isDone(action.id));
      } else if (typeof next === 'object') {
        for (let key in next) {
          let nextShape = this.getShape(next[key]);
          if (key === 'Y')
            this.drawConnection(shape, nextShape, '同意', this.isDone(action.id + 'Y'));
          else if (key === 'N')
            this.drawConnection(shape, nextShape, '驳回', this.isDone(action.id + 'N'));
        }
      }
    }
  }
};

Swimlane.prototype.drawConnection = function(curr, next, text, done) {
  this.context.beginPath();
  if (done === true) {
    this.setColorContext(curr.id);
  } else {
    this.setColorContext(null);
  }

  if (next.y > curr.y) {
    // 底部连接顶部
    this.context.moveTo(curr.x + curr.width / 2, curr.y + curr.height);
    this.context.lineTo(next.x + next.width / 2, next.y);
    this.context.stroke();
    if (text) {
      this.context.font = '12px arial';
      this.context.fillText(text, curr.x + curr.width / 2, curr.y + curr.height + 20);
    }
    // 箭头
    this.context.beginPath();
    this.context.moveTo(next.x + next.width / 2, next.y);
    this.context.lineTo(next.x + next.width / 2 + 3, next.y - 6);
    this.context.lineTo(next.x + next.width / 2 - 3, next.y - 6);
    this.context.lineTo(next.x + next.width / 2, next.y);
    this.context.fill();
    this.context.closePath();
  } else {
    if (next.x > curr.x) {
      // 右侧连接底部
      this.context.moveTo(curr.x + curr.width, curr.y + curr.height / 2);
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2, curr.y + curr.height / 2);
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2, next.y + next.height);
      this.context.stroke();
      if (text) {
        this.context.font = '12px arial';
        this.context.fillText(text, curr.x + curr.width, curr.y + curr.height / 2 + 20);
      }
      // 箭头
      this.context.beginPath();
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2, next.y + next.height);
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2 + 3, next.y + next.height + 6);
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2 - 3, next.y + next.height + 6);
      this.context.lineTo(curr.x + curr.width + this.gutter + next.width / 2, next.y + next.height);
      this.context.fill();
      this.context.closePath();
    } else {
      // 右侧链接右侧
      this.context.moveTo(curr.x + curr.width, curr.y + curr.height / 2);
      this.context.lineTo(curr.x + curr.width + this.gutter / 2, curr.y + curr.height / 2);
      this.context.lineTo(curr.x + curr.width + this.gutter / 2, next.y + next.height / 2);
      this.context.lineTo(next.x + next.width, next.y + next.height / 2);
      this.context.stroke();
      if (text) {
        this.context.font = '12px arial';
        this.context.fillText(text, curr.x + curr.width, curr.y + curr.height / 2 + 20);
      }
      // 箭头
      this.context.beginPath();
      this.context.lineTo(next.x + next.width, next.y + next.height / 2);
      this.context.lineTo(next.x + next.width + 6, next.y + next.height / 2 - 3);
      this.context.lineTo(next.x + next.width + 6, next.y + next.height / 2 + 3);
      this.context.lineTo(next.x + next.width, next.y + next.height / 2);
      this.context.fill();
      this.context.closePath();
    }
  }
  this.context.closePath();
};

Swimlane.prototype.getShape = function (id) {
  for (let i = 0; i < this.shapes.length; i++) {
    if (id === this.shapes[i].id)
      return this.shapes[i];
  }
  return null;
};

Swimlane.prototype.render = function(containerId) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  let rect = this.container.getBoundingClientRect();
  this.width = rect.width;
  this.height = rect.height;

  let canvas = document.createElement('canvas');
  this.context = canvas.getContext('2d');

  const scale = window.devicePixelRatio || 1;
  canvas.width = this.width * scale;
  canvas.height = this.height * scale;
  canvas.style.width = this.width + 'px';
  canvas.style.height = this.height + 'px';
  this.container.appendChild(canvas);
  this.context.scale(scale, scale);

  this.context.lineWidth = 2;
  this.context.fillStyle = this.colorDefault;
  this.context.strokeStyle = this.colorSuccess;

  this.draw();
};

Swimlane.prototype.isCompleted = function (id) {
  for (let i = 0; i < this.passed.length; i++) {
    if (this.passed[i].status === id ||
        this.passed[i].status === (id + 'Y')) {
      return true;
    }
  }
  return false;
};

Swimlane.prototype.isFailed = function (id) {
  for (let i = 0; i < this.passed.length; i++) {
    if (this.passed[i].status === (id + 'N')) {
      return true;
    }
  }
  return false;
};

Swimlane.prototype.isDone = function (id) {
  for (let i = 0; i < this.passed.length; i++) {
    if (this.passed[i].status === id) {
      return true;
    }
  }
  return false;
};

Swimlane.prototype.setColorContext = function (id) {
  if (this.isCompleted(id) === true) {
    this.context.fillStyle = this.colorSuccess;
    this.context.strokeStyle = this.colorSuccess;
  } else if (this.isFailed(id) === true) {
    this.context.fillStyle = this.colorFailed;
    this.context.strokeStyle = this.colorFailed;
  } else {
    this.context.fillStyle = this.colorDefault;
    this.context.strokeStyle = this.colorDefault;
  }
};

