
/**
 * 报表设计器构造函数。
 * <p>
 * 参数包括：
 * 1. containerId           容器的DOM标识
 * 2. propertiesEditor      属性编辑器实例
 * 
 * @param {object} options 
 */
function ReportDesigner(options) {
  let self = this;

  this.elements = [];
  // 页面元素
  this.containerId = options.containerId;
  this.container = dom.find(this.containerId);
  this.containerWidth = this.container.clientWidth;

  // 属性编辑器
  this.propertiesEditor = options.propertiesEditor;
  this.propertiesEditor.addPropertyChangedListener(this);

  this.bindDragOverEventListener();
  this.bindDropEventListener(this, this.drop);
  this.bindMouseDownEventListener(this, this.select);
  this.bindMouseMoveEventListener(this, this.move);
  this.bindMouseUpEventListener();

  // this.canvas.setAttribute('width', this.containerWidth);
  // this.canvas.setAttribute('height', options.canvasHeight);

  this.canvas.style = 'width: 100%; height: 100%;';

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

  // 数据结构定义
  this.dragging = null;

  // 画布的其他设置

  this.render();
}

ReportDesigner.prototype = new DesignCanvas();

ReportDesigner.TEXT_FONT_SIZE = 18;
ReportDesigner.TEXT_FONT_FAMILY = '宋体';
ReportDesigner.STROKE_STYLE_SELECTED = '#20a8d8';
ReportDesigner.STROKE_STYLE_ALIGNMENT = '#ffc107';
ReportDesigner.STROKE_STYLE_DEFAULT = 'black';

ReportDesigner.prototype.unselectAll = function (element) {
  for (let i = 0; i < this.elements.length; i++)
    this.elements[i].unselect();
  this.selectedElement = null;
};

ReportDesigner.prototype.onPropertyChanged = function (prop) {
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
ReportDesigner.prototype.addAndRenderElement = function (element) {
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
ReportDesigner.prototype.addText = function (text, x, y) {
  let elementText = new TextElement({
    x: x,
    y: y,
    text: text,
    selected: true
  });
  // 添加文本元素
  this.addAndRenderElement(elementText);
};

ReportDesigner.prototype.addLongtext = function (text, x, y) {
  let elementText = new LongtextElement({
    x: x,
    y: y,
    text: text,
    selected: true
  });
  // 添加文本元素
  this.addAndRenderElement(elementText);
};

ReportDesigner.prototype.addImage = function (x, y) {
  let elementImage = new ImageElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementImage);
};

ReportDesigner.prototype.addTable = function (x, y) {
  let elementTable = new TableElement({
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementTable);
};

ReportDesigner.prototype.addChart = function (x, y) {
  let elementChart = new ChartElement({
    subtype: '柱状图',
    x: x,
    y: y,
    selected: true
  });
  this.addAndRenderElement(elementChart);
};

ReportDesigner.prototype.drawGrid = function (w, h, strokeStyle, step) {
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


ReportDesigner.prototype.render = function () {
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
      ctx.strokeStyle = ReportDesigner.STROKE_STYLE_ALIGNMENT;
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
ReportDesigner.prototype.drag = function (ev) {
  let target = ev.target;
  self.dragging = target;

  self.dragX = ev.layerX;
  self.dragY = ev.layerY;

  ev.dataTransfer.setData('drag-type', ev.target.getAttribute('data-type'));
};

ReportDesigner.prototype.drop = function (self, ev) {
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
  }
};

/**
 * 鼠标按下事件的回调函数，业务化响应鼠标按下事件。
 */
ReportDesigner.prototype.select = function (self, ev) {
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
ReportDesigner.prototype.move = function (self, ev) {
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