
/**
 * 报表设计器构造函数。
 * <p>
 * 参数包括：
 * 1. containerId           容器的DOM标识
 * 2. propertiesEditor      属性编辑器实例
 * 
 * @param {object} options 
 */
function Canvas(options) {
  let self = this;

  this.elements = [];
  // 页面元素
  this.containerId = options.containerId;
  this.container = document.getElementById(this.containerId);
  this.containerWidth = this.container.clientWidth;

  // 属性编辑器
  this.propertiesEditor = options.propertiesEditor;
  this.propertiesEditor.addPropertyChangedListener(this);

  this.canvas = document.createElement('canvas');
  this.canvas.style = 'width: 100%; height: 100%';
  // this.canvas.setAttribute('width', this.containerWidth);
  // this.canvas.setAttribute('height', options.canvasHeight);

  //
  // 鼠标点击，只支持删除对象
  //
  document.addEventListener('keyup', function(ev) {
    if (ev.keyCode == 46 /*DEL*/) {
      if (!self.selectedElement) return;
      for (let i = 0; i < self.elements.length; i++) {
        if (self.elements[i].model.id == self.selectedElement.model.id) {
          self.elements.splice(i, 1);
          break;
        }
      }
      self.selectedElement = null;
      self.propertiesEditor.clear();
      self.render();
      // self.drawArrow(20, 20, 200, 100, [0, 1, -10, 1, -10, 5]);
    }
  });

  // 初始化设置
  this.container.innerHTML = '';
  this.container.appendChild(this.canvas);

  let dpr = window.devicePixelRatio || 1;
  let rect = this.canvas.getBoundingClientRect();
  this.canvas.width = rect.width * dpr;
  this.canvas.height = rect.height * dpr;
  this.canvas.getContext('2d').scale(dpr, dpr);

  this.bindDragOverEventListener();
  this.bindDropEventListener(this, this.drop);
  this.bindMouseDownEventListener(this, this.select);
  this.bindMouseMoveEventListener(this, this.move);
  this.bindMouseUpEventListener();

  // 数据结构定义
  this.dragging = null;

  // 画布的其他设置

  this.render();
}

Canvas.TEXT_FONT_SIZE = 18;
Canvas.TEXT_FONT_FAMILY = '宋体';
Canvas.STROKE_STYLE_SELECTED = '#20a8d8';
Canvas.STROKE_STYLE_ALIGNMENT = '#ffc107';
Canvas.STROKE_STYLE_DEFAULT = 'black';

Canvas.prototype.unselectAll = function (element) {
  for (let i = 0; i < this.elements.length; i++)
    this.elements[i].unselect();
  this.selectedElement = null;
};

Canvas.prototype.onPropertyChanged = function (prop) {
  if (this.selectedElement == null) return;
  this.selectedElement.notifyModelChangedListeners(prop);
  this.render();
};

/**
 * 添加设计器上的对象到设计器对象对对象的管理容器。
 *
 * @param {object} obj
 *        设计器新增加的对象
 */
Canvas.prototype.addAndRenderElement = function (element) {
  element.addModelChangedListener(this.propertiesEditor);
  this.elements.push(element);

  // 显示元素的属性编辑器
  this.propertiesEditor.render(element);
  // 取消所有原有的元素
  this.unselectAll();
  this.selectedElement = element;
  // 渲染
  this.render();
};

/**
 * 添加默认的文本到画布对象中。
 * 
 * @param {string} text
 *        the text
 * 
 * @param {number} x 
 *        the coordinate x in canvas
 * 
 * @param {number} y 
 *        the coordinate y in canvas
 */
Canvas.prototype.addText = function (text, x, y) {
  let elementText = new TextElement({
    x: x,
    y: y,
    text: text,
    selected: true
  });
  // 添加文本元素
  this.addAndRenderElement(elementText);
};

Canvas.prototype.addLongtext = function (text, x, y) {
  let elementText = new LongtextElement({
    x: x,
    y: y,
    text: text,
    selected: true
  });
  // 添加文本元素
  this.addAndRenderElement(elementText);
};

Canvas.prototype.addImage = function (x, y) {
  let elementImage = new ImageElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementImage);
};

Canvas.prototype.addTable = function (x, y) {
  let elementTable = new TableElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementTable);
};

Canvas.prototype.addChart = function (x, y) {
  let elementChart = new ChartElement({
    subtype: '柱状图',
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementChart);
};

Canvas.prototype.addVideo = function (x, y) {
  let element = new VideoElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(element);
};

Canvas.prototype.addQueue = function (x, y) {
  let element = new QueueElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(element);
};

Canvas.prototype.drawGrid = function (w, h, strokeStyle, step) {
  let ctx = this.canvas.getContext('2d');
  for (let x = 0.5; x < w; x += step){
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  
  for (let y = 0.5; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
};


Canvas.prototype.render = function () {
  let ctx = this.canvas.getContext('2d');

  // 清除画布
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // 网格线
  this.drawGrid(this.canvas.width, this.canvas.height, '#eee', 10);

  // 逐个画元素（根据元素的模型数据）
  for (let i = 0; i < this.elements.length; i++) {
    let element = this.elements[i];
    element.render(ctx);
  }

  if (this.alignmentLines && this.alignmentLines.length > 0) {
    for (let i = 0; i < this.alignmentLines.length; i++) {
      let alignmentLine = this.alignmentLines[i];
      ctx.beginPath();
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = Canvas.STROKE_STYLE_ALIGNMENT;
      ctx.lineWidth = 1;
      let line = alignmentLine;
      if (line.x) {
        ctx.moveTo(line.x, 0);
        ctx.lineTo(line.x, this.canvas.height);
        ctx.stroke();
      } else {
        ctx.moveTo(0, line.y);
        ctx.lineTo(this.canvas.width, line.y);
        ctx.stroke();
      }
      ctx.closePath();
      ctx.setLineDash([]);
    }
  }
};

/**
 * 
 */
Canvas.prototype.drag = function (ev) {
  let target = ev.target;
  self.dragging = target;

  self.dragX = ev.layerX;
  self.dragY = ev.layerY;

  ev.dataTransfer.setData('drag-type', ev.target.getAttribute('data-type'));
};

Canvas.prototype.drop = function (self, ev) {
  let rect = self.canvas.getBoundingClientRect();
  let x = ev.clientX - rect.left;
  let y = ev.clientY - rect.top;

  let dragType = ev.dataTransfer.getData('drag-type');
  if (dragType == 'text') {
    self.addText('这里是标题', x, y);
  } else if (dragType == 'longtext') {
    self.addLongtext('这是长文本的示例，长文本允许折行显示，适合显示描述性的文本内容。', x, y);
  } else if (dragType == 'table') {
    self.addTable(x, y);
  } else if (dragType == 'image') {
    self.addImage(x, y);
  } else if (dragType == 'chart') {
    self.addChart(x, y);
  } else if (dragType == 'video') {
    self.addVideo(x, y);
  } else if (dragType == 'queue') {
    self.addQueue(x, y);
  }
};

/**
 * 鼠标按下事件的回调函数，业务化响应鼠标按下事件。
 */
Canvas.prototype.select = function (self, ev) {
  if (ev.button != 0) return;
  let rect = self.canvas.getBoundingClientRect();
  let clickX = ev.clientX - rect.left;
  let clickY = ev.clientY - rect.top;

  // reset selected object in designer
  self.unselectAll();

  for (let i = 0; i < self.elements.length; i++) {
    let elm = self.elements[i];
    // check the mouse position is or not in the object shape.
    if (elm.select(clickX, clickY)) {
      // allow to move
      self.isMoving = true;
      self.offsetMoveX = clickX - elm.model.x;
      self.offsetMoveY = clickY - elm.model.y;
      self.selectedElement = elm;
      break;
    }
  }

  // 光标改变
  if (self.selectedElement) {
    let resizeType = self.showResizeCursor(ev);
    if (resizeType == 'none' || self.selectedElement.model.type == 'text') {
      self.isMoving = true;
      self.canvas.style.cursor = 'move';
    } else {
      self.resizeType = resizeType;
      self.isResizing = true;
    }
    self.propertiesEditor.render(self.selectedElement);
  } else {
    self.propertiesEditor.clear();
  }

  // 重新渲染，如果选择了则显示选择的边框；如果没有，则消除选择的边框
  self.render();
};

/**
 * 鼠标移动事件的回调函数，业务化的鼠标移动控制。
 */
Canvas.prototype.move = function (self, ev) {
  // 没有选择
  if (self.selectedElement == null) return;
  if (!self.isMoving && !self.isResizing) return;

  let resizeType = self.resizeType;
  
  let rect = self.canvas.getBoundingClientRect();
  let moveX = ev.clientX - rect.left;
  let moveY = ev.clientY - rect.top;

  if (resizeType == 'east') {
    let offsetX = moveX - self.selectedElement.model.x - self.selectedElement.model.width;
    self.selectedElement.model.width = self.selectedElement.model.width + offsetX;
  } else if (resizeType == 'west') {
    let offsetX = self.selectedElement.model.x - moveX;
    self.selectedElement.model.x = moveX;
    self.selectedElement.model.width = self.selectedElement.model.width + offsetX;
  } else if (resizeType == 'north') {
    let offsetY = self.selectedElement.model.y - moveY;
    self.selectedElement.model.y = moveY;
    self.selectedElement.model.height = self.selectedElement.model.height + offsetY;
  } else if (resizeType == 'south') {
    let offsetY = moveY - self.selectedElement.model.y - self.selectedElement.model.height;
    self.selectedElement.model.height = self.selectedElement.model.height + offsetY;
  } else {
    self.canvas.style.cursor = 'move';
    self.selectedElement.model.x = moveX - self.offsetMoveX;
    self.selectedElement.model.y = moveY - self.offsetMoveY;
  }
  self.selectedElement.notifyModelChangedListeners({
    x: self.selectedElement.model.x,
    y: self.selectedElement.model.y,
    width: self.selectedElement.model.width,
    height: self.selectedElement.model.height
  });

  // 渲染
  self.render();
};

/**
 *
 */
Canvas.prototype.bindDragOverEventListener = function () {
  // 拖拽到canvas上面时的事件处理函数
  this.canvas.addEventListener('dragover', function(ev) {
    ev.preventDefault();
  });
};

/**
 *
 */
Canvas.prototype.bindDropEventListener = function (self, callback) {
  // 在canvas上面释放拖拽对象时的事件处理函数
  this.canvas.addEventListener('drop', function (ev) {
    ev.preventDefault();
    callback(self, ev);
  });
};

/**
 * 绑定鼠标点击事件。
 */
Canvas.prototype.bindMouseDownEventListener = function (self, callback) {
  // 在canvas上响应鼠标按钮按下的事件处理函数
  this.canvas.addEventListener('mousedown', function(ev) {
    // 重置已经选择的对象
    self.selectedElement = null;

    // 绘制对齐辅助线
    self.getAlignmentLines();

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
Canvas.prototype.bindMouseMoveEventListener = function (self, callback) {
  this.canvas.addEventListener('mousemove', function(ev) {
    let resizeType = 'none';
    if (self.selectedElement == null) {
      return;
    }
    if (!self.isMoving && !self.isResizing)  return;

    self.getAlignmentLines();
    callback(self, ev);
    if (self.selectedElement != null) {
      self.isMoving = true;
    }
  });
};

/**
 * 绑定鼠标按钮弹起事件的监听处理器，无需回调处理。
 */
Canvas.prototype.bindMouseUpEventListener = function () {
  let self = this;
  this.canvas.addEventListener('mouseup', function(ev) {
    self.isMoving = false;
    self.isResizing = false;
    self.resizeType = 'none';
    self.alignmentLine = null;
    self.canvas.style.cursor = 'default';
  });
};

/**
 * 画箭头的函数，基本功能的封装。
 */
Canvas.prototype.drawArrow = function(startX, startY, endX, endY, controlPoints) {
  let ctx = this.canvas.getContext("2d");
  ctx.beginPath();

  let dx = endX - startX;
  let dy = endY - startY;
  let len = Math.sqrt(dx * dx + dy * dy);
  let sin = dy / len;
  let cos = dx / len;
  let a = [];
  a.push(0, 0);
  for (let i = 0; i < controlPoints.length; i += 2) {
    let x = controlPoints[i];
    let y = controlPoints[i + 1];
    a.push(x < 0 ? len + x : x, y);
  }
  a.push(len, 0);
  for (let i = controlPoints.length; i > 0; i -= 2) {
    let x = controlPoints[i - 2];
    let y = controlPoints[i - 1];
    a.push(x < 0 ? len + x : x, -y);
  }
  a.push(0, 0);
  for (let i = 0; i < a.length; i += 2) {
    let x = a[i] * cos - a[i + 1] * sin + startX;
    let y = a[i] * sin + a[i + 1] * cos + startY;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.fill();
};

/**
 * 利用点到线的直线距离来选取哪根线条。
 */
Canvas.prototype.showResizeCursor = function (ev) {
  let self = this;

  if (!self.selectedElement) return;

  let rect = self.canvas.getBoundingClientRect();
  let x = ev.clientX - rect.left;
  let y = ev.clientY - rect.top;

  let threshold = 10;

  let sel = self.selectedElement.model;

  let topX = sel.x;
  let topY = sel.y;
  let botX = sel.x + sel.width;
  let botY = sel.y + sel.height;

  // 顶端线条
  let distance = this.calculateVerticalDistance(x, y, topX, topY, botX, topY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 'n-resize';
    return 'north';
  }
  // 底端线条
  distance = this.calculateVerticalDistance(x, y, topX, botY, botX, botY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 's-resize';
    return 'south';
  }
  // 左侧线条
  distance = this.calculateVerticalDistance(x, y, topX, topY, topX, botY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 'w-resize';
    return 'west';
  }
  // 右侧线条
  distance = this.calculateVerticalDistance(x, y, botX, topY, botX, topY);
  if (distance <= threshold) {
    self.canvas.style.cursor = 'e-resize';
    return 'east';
  }
  self.canvas.style.cursor = 'default';
  return 'none';
};

/**
 * 画辅助对齐线。
 */
Canvas.prototype.getAlignmentLines = function() {
  let threshold = 10;
  this.alignmentLines = [];
  if (!this.selectedElement) {
    return;
  }

  let topX = this.selectedElement.model.x;
  let topY = this.selectedElement.model.y;
  let botX = this.selectedElement.model.x + this.selectedElement.model.width;
  let botY = this.selectedElement.model.y + this.selectedElement.model.height;

  let existings = {};
  for (let i = 0; i < this.elements.length; i++) {
    let obj = this.elements[i];
    if (obj.model.id == this.selectedElement.model.id) {
      continue;
    }
    let objTopX = obj.model.x;
    let objTopY = obj.model.y;
    let objBotX = obj.model.x + obj.model.width;
    let objBotY = obj.model.y + obj.model.height;
    // left to left
    if (Math.abs(topX - objTopX) <= threshold && !existings['x-' + objTopX]) {
      this.alignmentLines.push({x: objTopX});
    }
    if (Math.abs(topX - objBotX) <= threshold && !existings['x-' + objBotX]) {
      this.alignmentLines.push({x: objBotX});
    }
    if (Math.abs(botX - objTopX) <= threshold && !existings['x-' + objTopX]) {
      this.alignmentLines.push({x: objTopX});
    }
    if (Math.abs(botX - objBotX) <= threshold && !existings['x-' + objBotX]) {
      this.alignmentLines.push({x: objBotX});
    }
    if (Math.abs(topY - objTopY) <= threshold && !existings['y-' + objTopY]) {
      this.alignmentLines.push({y: objTopY});
    }
    if (Math.abs(topY - objBotY) <= threshold && !existings['y-' + objBotY]) {
      this.alignmentLines.push({y: objBotY});
    }
    if (Math.abs(botY - objTopY) <= threshold && !existings['y-' + objTopY]) {
      this.alignmentLines.push({y: objTopY});
    }
    if (Math.abs(botY - objBotY) <= threshold && !existings['y-' + objBotY]) {
      this.alignmentLines.push({y: objBotY});
    }
  }
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
Canvas.prototype.calculateVerticalDistance = function (pointX, pointY, linePointX1, linePointY1, linePointX2, linePointY2) {
  if (linePointX1 == linePointX2) {
    return Math.abs(pointX - linePointX1);
  }
  if (linePointY1 == linePointY2) {
    return Math.abs(pointY - linePointY1);
  }
  // 计算直线方程，两点式：two-point form
  // (x - x1) / (x2 - x1) = (y - y1) / (y2 - y1)
  // y = kx + b
  let xd = (linePointX1 - linePointX2);
  let b = (linePointX1 * linePointY2 - linePointX2 * linePointY1 - linePointX2 * linePointY1 + linePointX2 * linePointY2);
  let k = (linePointY1 - linePointY2);
  // TODO
};