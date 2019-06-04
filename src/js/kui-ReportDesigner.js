
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
  var self = this;

  // 页面元素
  this.containerId = options.containerId;
  this.container = document.getElementById(this.containerId);
  this.containerWidth = this.container.clientWidth;

  // 属性编辑器
  this.propertiesEditor = options.propertiesEditor;

  this.bindDragOverEventListener();
  this.bindDropEventListener(this, this.drop);
  this.bindMouseDownEventListener(this, this.select);
  this.bindMouseMoveEventListener(this, this.move);
  this.bindMouseUpEventListener();

  this.canvas.setAttribute('width', this.containerWidth);
  this.canvas.setAttribute('height', options.canvasHeight);

  document.addEventListener('keyup', function(ev) {
    if (ev.keyCode == 46 /*DEL*/) {
      if (!self.selected) return;
      for (var i = 0; i < self.objects.length; i++) {
        if (self.objects[i].id == self.selected.id) {
          self.objects.splice(i, 1);
          break;
        }
      }
      self.selected = null;
      self.propertiesEditor.setSelected(null);
      self.render();
      
      self.drawArrow(20, 20, 200, 100, [0, 1, -10, 1, -10, 5]);
    }
  });

  // 初始化设置
  this.container.innerHTML = '';
  this.container.appendChild(this.canvas);

  // 数据结构定义
  this.objects = [];
  this.selected = null;
  this.moving = false;
  this.dragging = null;

  // 画布的其他设置

  this.render();
}

ReportDesigner.prototype = new DesignCanvas();

ReportDesigner.TEXT_FONT_SIZE = '18';
ReportDesigner.TEXT_FONT_FAMILY = '宋体';
ReportDesigner.STROKE_STYLE_SELECTED = 'red';
ReportDesigner.STROKE_STYLE_DEFAULT = 'black';

/**
 * 添加设计器上的对象到设计器对象对对象的管理容器。
 * 
 * @param {object} obj
 *        设计器新增加的对象
 */
ReportDesigner.prototype.addObject = function (obj) {
  obj.position = function() {
    return '(' + parseInt(this.x) + ", " + parseInt(this.y) + ", " 
               + parseInt(this.width) + ', ' +  parseInt(this.height) + ')';
  }
  obj.font = function() {
    return obj.fontSize + 'px ' + obj.fontFamily; 
  }
  this.objects.push(obj);
}

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
  var textObj = {
    id: 'text-' + moment().valueOf(),
    text: text,
    type: 'text',
    fontSize: ReportDesigner.TEXT_FONT_SIZE,
    fontFamily: ReportDesigner.TEXT_FONT_FAMILY,
    x: x,
    y: y,
    height: parseInt(ReportDesigner.TEXT_FONT_SIZE),
    selected: false
  };
  
  this.addObject(textObj);

  this.renderText(textObj);
};

/**
 * 在画布对象中渲染一个文本对象。
 * 
 * @param {object} textObj
 *        文本对象
 */
ReportDesigner.prototype.renderText = function (textObj) {
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = textObj.color || ReportDesigner.STROKE_STYLE_DEFAULT;
  ctx.font = textObj.font();
 
  textObj.width = ctx.measureText(textObj.text).width;
  // 文本的高度设置特殊性
  textObj.height = parseInt(textObj.fontSize);

  ctx.fillText(textObj.text, textObj.x, textObj.y + textObj.height);
  
  if (textObj.selected) {
    var offsetX = 5;
    var offsetY = 2;
    
    ctx.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
    ctx.beginPath();
    // left-top
    ctx.moveTo(textObj.x - offsetX, textObj.y - offsetY);
    // left-bottom
    ctx.lineTo(textObj.x - offsetX, textObj.y + textObj.height + offsetY + 3);
    // right-bottom
    ctx.lineTo(textObj.x + textObj.width + offsetX, textObj.y + textObj.height + offsetY + 3);
    // right-top
    ctx.lineTo(textObj.x + textObj.width + offsetX, textObj.y - offsetY);
    // left-top
    ctx.lineTo(textObj.x - offsetX, textObj.y - offsetY);
    ctx.stroke();
  }
}

ReportDesigner.prototype.addTable = function (x, y) {
  var now = moment();
  var tableObj = {
    id: 'table-' + now.valueOf(),
    type: 'table',
    fontSize: ReportDesigner.TEXT_FONT_SIZE,
    fontFamily: ReportDesigner.TEXT_FONT_FAMILY,
    columns: [{
      title: '列标题1'
    }, {
      title: '列标题2'
    }, {
      title: '列标题3'
    }],
    x: x,
    y: y,
    width: 500,
    height: 300,
    selected: false
  };

  this.addObject(tableObj);

  this.renderTable(tableObj);
};

ReportDesigner.prototype.renderTable = function (tableObj) {
  var ctx = this.canvas.getContext('2d');
  ctx.font = tableObj.font();

  if (tableObj.selected) {
    ctx.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
  } else {
    ctx.strokeStyle = ReportDesigner.STROKE_STYLE_DEFAULT;
  }
  ctx.beginPath();

  // left-top
  ctx.moveTo(tableObj.x, tableObj.y);
  // left-bottom
  ctx.lineTo(tableObj.x, tableObj.y + tableObj.height);
  // right-bottom
  ctx.lineTo(tableObj.x + tableObj.width, tableObj.y + tableObj.height);
  // right-top
  ctx.lineTo(tableObj.x + tableObj.width, tableObj.y);
  // left-top
  ctx.lineTo(tableObj.x, tableObj.y);
  ctx.stroke();
  
  ctx.strokeStyle = 'black';
  ctx.font = tableObj.font();

  for (var i = 0; i < tableObj.columns.length; i++) {
    ctx.fillText(tableObj.columns[i].title, tableObj.x + 30 + (150 * i), tableObj.y + 30);
  }
  
};

ReportDesigner.prototype.addChart = function (x, y) {
  var now = moment();
  var chartObj = {
    id: 'chart-' + now.valueOf(),
    type: 'chart',
    subtype: 'bar',
    x: x,
    y: y,
    width: 500,
    height: 300,
    selected: false
  };

  this.addObject(chartObj);

  this.renderChart(chartObj);
};

ReportDesigner.prototype.renderChart = function (chartObj) {
  var ctx = this.canvas.getContext('2d');

  var img = document.getElementById('chart_' + chartObj.subtype);
  var sWidth = img.naturalWidth;
  var sHeight = img.naturalHeight;

  ctx.drawImage(img, 0, 0, sWidth, sHeight, chartObj.x, chartObj.y, chartObj.width, chartObj.height);
  
  if (chartObj.selected) {
    var offsetX = 2;
    var offsetY = 2;
    ctx.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
    ctx.beginPath();
    // left-top
    ctx.moveTo(chartObj.x - offsetX, chartObj.y - offsetY);
    // left-bottom
    ctx.lineTo(chartObj.x - offsetX, chartObj.y + chartObj.height + offsetY);
    // right-bottom
    ctx.lineTo(chartObj.x + chartObj.width + offsetX, chartObj.y + chartObj.height + offsetY);
    // right-top
    ctx.lineTo(chartObj.x + chartObj.width + offsetX, chartObj.y - offsetY);
    // left-top
    ctx.lineTo(chartObj.x - offsetX, chartObj.y - offsetY);
    ctx.stroke();
  }
}

ReportDesigner.prototype.addImage = function (x, y) {
  var now = moment();
  var imageObj = {
    id: 'image-' + now.valueOf(),
    type: 'image',
    x: x,
    y: y,
    width: 100,
    height: 100
  };
  
  this.addObject(imageObj);

  this.renderImage(imageObj);
};

ReportDesigner.prototype.renderImage = function (imageObj) {
  var ctx = this.canvas.getContext('2d');
  var img = document.getElementById('test_image');
  var sWidth = img.naturalWidth;
  var sHeight = img.naturalHeight;
  ctx.drawImage(img, 0, 0, sWidth, sHeight, imageObj.x, imageObj.y, imageObj.width, imageObj.height);

  if (imageObj.selected) {
    var offsetX = 2;
    var offsetY = 2;
    ctx.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
    ctx.beginPath();
    // left-top
    ctx.moveTo(imageObj.x - offsetX, imageObj.y - offsetY);
    // left-bottom
    ctx.lineTo(imageObj.x - offsetX, imageObj.y + imageObj.height + offsetY);
    // right-bottom
    ctx.lineTo(imageObj.x + imageObj.width + offsetX, imageObj.y + imageObj.height + offsetY);
    // right-top
    ctx.lineTo(imageObj.x + imageObj.width + offsetX, imageObj.y - offsetY);
    // left-top
    ctx.lineTo(imageObj.x - offsetX, imageObj.y - offsetY);
    ctx.stroke();
  }
};

ReportDesigner.prototype.drawGrid = function (w, h, strokeStyle, step) {
  var ctx = this.canvas.getContext('2d');
  for (var x = 0.5; x < w; x += step){
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  
  for (var y = 0.5; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
}

ReportDesigner.prototype.render = function () {
  // 画网格线
  // this.drawDotLines();
  var ctx = this.canvas.getContext('2d');
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  this.drawGrid(this.canvas.width, this.canvas.height, '#eee', 10);

  for (var i = 0; i < this.objects.length; i++) {
    var obj = this.objects[i];
    if (obj.type == 'text') {
      this.renderText(obj);
    } else if (obj.type == 'table') {
      this.renderTable(obj);
    } else if (obj.type == 'image') {
      this.renderImage(obj);
    } else if (obj.type == 'chart') {
      this.renderChart(obj);
    }
  }
};

/**
 * 
 */
ReportDesigner.prototype.drag = function (ev) {
  var target = ev.target;
  self.dragging = target;

  self.dragX = ev.layerX;
  self.dragY = ev.layerY;

  ev.dataTransfer.setData('drag-type', ev.target.getAttribute('data-type'));
};

ReportDesigner.prototype.drop = function (self, ev) {
  var rect = self.canvas.getBoundingClientRect();
  var x = ev.clientX - rect.left;
  var y = ev.clientY - rect.top;

  var dragType = ev.dataTransfer.getData('drag-type');
  if (dragType == 'text') {
    self.addText('这里是标题', x, y);
  } else if (dragType == 'table') {
    self.addTable(x, y);
  } else if (dragType == 'image') {
    self.addImage(x, y);
  } else if (dragType == 'chart') {
    self.addChart(x, y);
  }
};

ReportDesigner.prototype.select = function (self, ev) {
  if (ev.button != 0) return;
  var rect = self.canvas.getBoundingClientRect();
  var clickX = ev.clientX - rect.left;
  var clickY = ev.clientY - rect.top;

  // reset selected object in designer
  self.selected = null;

  // reset each object selected property to false
  for (var i = 0; i < self.objects.length; i++) {
    var obj = self.objects[i];
    obj.selected = false;
  }

  for (var i = 0; i < self.objects.length; i++) {
    var obj = self.objects[i];
    // check the mouse position is or not in the object shape.
    if ((clickX >= obj.x && clickX <= (obj.x + obj.width)) &&
        (clickY >= obj.y && clickY <= (obj.y + obj.height))) {
      obj.selected = true;
      self.selected = obj;
      // allow to move
      self.moving = true;
      self.offsetMoveX = clickX - self.selected.x;
      self.offsetMoveY = clickY - self.selected.y;
      break;
    }
  }

  self.propertiesEditor.setSelected(self.selected);

  // 重新渲染，如果选择了则显示选择的边框；如果没有，则消除选择的边框
  self.render();
};

ReportDesigner.prototype.move = function (self, ev) {
  if (self.selected == null) return;
  if (!self.moving) return;

  var rect = self.canvas.getBoundingClientRect();
  var moveX = ev.clientX - rect.left;
  var moveY = ev.clientY - rect.top;
  
  self.selected.x = moveX - self.offsetMoveX;
  self.selected.y = moveY - self.offsetMoveY;

  // 实时更新位置属性
  self.propertiesEditor.setSelected(self.selected);

  self.render();
};