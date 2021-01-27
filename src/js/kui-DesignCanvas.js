
/**
 * 设计画布类型定义，一切利用html canvas技术业务实现的基类。
 */
function DesignCanvas() {
  // 在画布上选中的对象
    this.selectedElement = null;
    this.objects = [];
    this.alignmentLines = [];
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
  DesignCanvas.prototype.bindMouseMoveEventListener = function (self, callback) {
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
  DesignCanvas.prototype.bindMouseUpEventListener = function () {
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
  DesignCanvas.prototype.drawArrow = function(startX, startY, endX, endY, controlPoints) {
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
  DesignCanvas.prototype.showResizeCursor = function (ev) {
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
  DesignCanvas.prototype.getAlignmentLines = function() {
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
    let xd = (linePointX1 - linePointX2);
    let b = (linePointX1 * linePointY2 - linePointX2 * linePointY1 - linePointX2 * linePointY1 + linePointX2 * linePointY2);
    let k = (linePointY1 - linePointY2);
    // TODO
  };