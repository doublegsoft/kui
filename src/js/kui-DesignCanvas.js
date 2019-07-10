
/**
 * 设计画布类型定义，一切利用html canvas技术业务实现的基类。
 */
function DesignCanvas() {
// 在画布上选中的对象
  this.selected = null;
  this.isMoving = false;
  this.isResizing = false;
  this.resizeType = 'none';

  // 页面实际的画布对象
  this.canvas = document.createElement('canvas');
}

/**
 * 
 */
DesignCanvas.prototype.bindDragOverEventListener = function () {
  // 拖拽到canvas上面时的事件处理函数
  this.canvas.addEventListener('dragover', function(ev) {
    ev.preventDefault();
  });
};

/**
 * 
 */
DesignCanvas.prototype.bindDropEventListener = function (self, callback) {
  // 在canvas上面释放拖拽对象时的事件处理函数
  var self = this;
  this.canvas.addEventListener('drop', function (ev) {
    ev.preventDefault();
    callback(self, ev);
  });
};

/**
 * 绑定鼠标点击事件。
 */
DesignCanvas.prototype.bindMouseDownEventListener = function (self, callback) {
  // 在canvas上响应鼠标按钮按下的事件处理函数
  this.canvas.addEventListener('mousedown', function(ev) {
    // 重置已经选择的对象
    self.selected = null;
    
    // 利用坐标体系算法获取当前的选择对象
    callback(self, ev);
  });
};

/**
 * 绑定鼠标移动事件的监听处理器，适用于点选了可移动的Canvas对象。
 * 
 * @param {object} self
 *        继承此基类的子类的对象，用于回调函数中。
 * 
 * @param {object} callback
 *        鼠标移动的回调函数。
 * 
 * @since 1.0
 * 
 * @version 1.1 - 增加鼠标移动到四周或者角落，调整为可以拉升的图标
 */
DesignCanvas.prototype.bindMouseMoveEventListener = function (self, callback) {
  this.canvas.addEventListener('mousemove', function(ev) {
    var resizeType = 'none';
    if (self.selected == null) {
      return;
    }
    if (!self.isMoving && !self.isResizing)  return;
    
    callback(self, ev);
    if (self.selected != null) {
      self.isMoving = true;
    }
  });
};

/**
 * 绑定鼠标按钮弹起事件的监听处理器，无需回调处理。
 */
DesignCanvas.prototype.bindMouseUpEventListener = function () {
  var self = this;
  this.canvas.addEventListener('mouseup', function(ev) {
    self.isMoving = false;
    self.isResizing = false;
    self.resizeType = 'none';
    self.canvas.style.cursor = 'default';
  });
};

/**
 * 画箭头的函数，基本功能的封装。
 */
DesignCanvas.prototype.drawArrow = function(startX, startY, endX, endY, controlPoints) {
  var ctx = this.canvas.getContext("2d");
  ctx.beginPath();

  var dx = endX - startX;
  var dy = endY - startY;
  var len = Math.sqrt(dx * dx + dy * dy);
  var sin = dy / len;
  var cos = dx / len;
  var a = [];
  a.push(0, 0);
  for (var i = 0; i < controlPoints.length; i += 2) {
    var x = controlPoints[i];
    var y = controlPoints[i + 1];
    a.push(x < 0 ? len + x : x, y);
  }
  a.push(len, 0);
  for (var i = controlPoints.length; i > 0; i -= 2) {
    var x = controlPoints[i - 2];
    var y = controlPoints[i - 1];
    a.push(x < 0 ? len + x : x, -y);
  }
  a.push(0, 0);
  for (var i = 0; i < a.length; i += 2) {
    var x = a[i] * cos - a[i + 1] * sin + startX;
    var y = a[i] * sin + a[i + 1] * cos + startY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.fill();
};

/**
 * 利用点到线的直线距离来选取哪根线条。
 */
DesignCanvas.prototype.showResizeCursor = function (ev) {
  var self = this;

  if (!self.selected) return;

  var rect = self.canvas.getBoundingClientRect();
  var x = ev.clientX - rect.left;
  var y = ev.clientY - rect.top;

  var threshhold = 5;

  var sel = self.selected;

  var topX = sel.x;
  var topY = sel.y;
  var botX = sel.x + sel.width;
  var botY = sel.y + sel.height;

  // 顶端线条
  var distance = this.calculateVerticalDistance(x, y, topX, topY, botX, topY);
  if (distance <= threshhold) {
    self.canvas.style.cursor = 'n-resize';
    return 'north';
  }
  // 底端线条
  distance = this.calculateVerticalDistance(x, y, topX, botY, botX, botY);
  if (distance <= threshhold) {
    self.canvas.style.cursor = 's-resize';
    return 'south';
  }
  // 左侧线条
  distance = this.calculateVerticalDistance(x, y, topX, topY, topX, botY);
  if (distance <= threshhold) {
    self.canvas.style.cursor = 'w-resize';
    return 'west';
  }
  // 右侧线条
  distance = this.calculateVerticalDistance(x, y, botX, topY, botX, topY);
  if (distance <= threshhold) {
    self.canvas.style.cursor = 'e-resize';
    return 'east';
  }
  self.canvas.style.cursor = 'default';
  return 'none';
};

/**
 * 计算点到线的垂直距离。
 * 
 * @param {number} pointX
 *        需要计算的点的X坐标
 * 
 * @param {number} pointY
 *        需要计算的店的Y坐标
 * 
 * @param {number} linePointX1
 *        线其中一个端点的X坐标
 * 
 * @param {number} linePointY1
 *        线其中一个端点的Y坐标
 * 
 * @param {number} linePointX2
 *        线其中一个端点的X坐标
 * 
 * @param {number} linePointY2
 *        线其中一个端点的Y坐标
 */
DesignCanvas.prototype.calculateVerticalDistance = function (pointX, pointY, linePointX1, linePointY1, linePointX2, linePointY2) {
  if (linePointX1 == linePointX2) {
    return Math.abs(pointX - linePointX1);
  }
  if (linePointY1 == linePointY2) {
    return Math.abs(pointY - linePointY1);
  }
  // 计算直线方程，两点式：two-point form
  // (x - x1) / (x2 - x1) = (y - y1) / (y2 - y1)
  // y = kx + b
  var xd = (linePointX1 - linePointX2);
  var b = (linePointX1 * linePointY2 - linePointX2 * linePointY1 - linePointX2 * linePointY1 + linePointX2 * linePointY2);
  var k = (linePointY1 - linePointY2);
};