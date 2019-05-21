
/**
 * 报表设计器构造函数。
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
  this.propertiesEditorId = options.propertiesEditorId;
  this.propertiesEditor = document.getElementById(this.propertiesEditorId);

  // div[id="' + this.propertiesEditorId + '"] 
  this.propertyTextInput = this.propertiesEditor.querySelector('input[name="text"]');
  this.propertyIdInput = this.propertiesEditor.querySelector('input[name="id"]');
  this.propertyPositionInput = this.propertiesEditor.querySelector('input[name="position"]');

  this.font

  /*
   * 加入发生改变时，画布上的文本内容实时发生改变。
   */
  this.propertyTextInput.addEventListener("keyup", function(evt) {
    if (!self.selected) return;
    self.selected.text = self.propertyTextInput.value;
    self.render();
  })

  // not working
  // this.conatinerHeight = this.container.style.height;

  this.canvas = document.createElement('canvas');
  this.canvas.setAttribute('width', this.containerWidth);
  this.canvas.setAttribute('height', options.canvasHeight);

  this.canvas.addEventListener('dragover', function(ev) {
    ev.preventDefault();
  });

  this.canvas.addEventListener('drop', function (ev) {
    ev.preventDefault();
    self.drop(ev);
  });

  this.canvas.addEventListener('mousedown', function(ev) {
    // reset selected object to null in this designer
    self.selected = null;
    // and use coordinate algorithm to select object
    self.select(ev);
  });

  this.canvas.addEventListener('mousemove', function(ev) {
    if (self.selected == null) {
      return;
    }
    if (!self.moving) {
      return;
    }
    self.move(ev);
    if (self.selected != null) {
      self.moving = true;
    }
  });

  this.canvas.addEventListener('mouseup', function(ev) {
    self.moving = false;
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

ReportDesigner.TEXT_FONT = '18px 宋体';
ReportDesigner.STROKE_STYLE_SELECTED = 'red';
ReportDesigner.STROKE_STYLE_DEFAULT = 'black';

/**
 * 
 */
ReportDesigner.prototype.addObject = function (obj) {
  obj.position = function() {
    return '(' + parseInt(this.x) + ", " + parseInt(this.y) + ", " 
               + parseInt(this.width) + ', ' +  parseInt(this.height) + ')';
  }
  this.objects.push(obj);
}

/**
 * Adds a text to a canvas.
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
    font: ReportDesigner.TEXT_FONT,
    fontFamily: '宋体',
    x: x,
    y: y,
    height: 18,
    selected: false
  };
  
  this.addObject(textObj);

  this.renderText(textObj);
};

/**
 * Renders a text object in canvas.
 * 
 * @param {object} textObj
 *        the text object
 */
ReportDesigner.prototype.renderText = function (textObj) {
  var ctx = this.canvas.getContext('2d');
  ctx.fillStyle = textObj.color || ReportDesigner.STROKE_STYLE_DEFAULT;
  ctx.font = textObj.font || ReportDesigner.TEXT_FONT;

  ctx.fillText(textObj.text, textObj.x, textObj.y + textObj.height);
  
  textObj.width = ctx.measureText(textObj.text).width;

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
  ctx.font = ReportDesigner.TEXT_FONT;

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

ReportDesigner.prototype.drag = function (ev) {
  var target = ev.target;
  this.dragging = target;

  this.dragX = ev.layerX;
  this.dragY = ev.layerY;

  ev.dataTransfer.setData('drag-type', ev.target.getAttribute('data-type'));
};

ReportDesigner.prototype.drop = function (ev) {
  ev.preventDefault();
  var rect = this.canvas.getBoundingClientRect();
  var x = ev.clientX - rect.left;
  var y = ev.clientY - rect.top;

  var dragType = ev.dataTransfer.getData('drag-type');
  if (dragType == 'text') {
    this.addText('这里是标题', x, y);
  } else if (dragType == 'table') {
    this.addTable(x, y);
  } else if (dragType == 'image') {
    this.addImage(x, y);
  } else if (dragType == 'chart') {
    this.addChart(x, y);
  }
};

ReportDesigner.prototype.select = function (ev) {
  if (ev.button != 0) return;
  var rect = this.canvas.getBoundingClientRect();
  var clickX = ev.clientX - rect.left;
  var clickY = ev.clientY - rect.top;

  // reset selected object in designer
  this.selected = null;

  // reset each object selected property to false
  for (var i = 0; i < this.objects.length; i++) {
    var obj = this.objects[i];
    obj.selected = false;
  }

  for (var i = 0; i < this.objects.length; i++) {
    var obj = this.objects[i];
    // check the mouse position is or not in the object shape.
    if ((clickX >= obj.x && clickX <= (obj.x + obj.width)) &&
        (clickY >= obj.y && clickY <= (obj.y + obj.height))) {
      obj.selected = true;
      this.selected = obj;
      // allow to move
      this.moving = true;
      this.offsetMoveX = clickX - this.selected.x;
      this.offsetMoveY = clickY - this.selected.y;
      break;
    }
  }

  // 显示选择的空间属性
  if (this.selected) {
    if (this.selected.text) {
      this.propertyTextInput.value = this.selected.text;
    }
    this.propertyIdInput.value = this.selected.id;
    this.propertyPositionInput.value = this.selected.position();
  } else {
    this.propertyTextInput.value = '';
    this.propertyIdInput.value = '';
    this.propertyPositionInput.value = '';
  }

  // 重新渲染，如果选择了则显示选择的边框；如果没有，则消除选择的边框
  this.render();
};

ReportDesigner.prototype.move = function (ev) {
  if (this.selected == null) return;
  if (!this.moving) return;

  var rect = this.canvas.getBoundingClientRect();
  var moveX = ev.clientX - rect.left;
  var moveY = ev.clientY - rect.top;
  
  this.selected.x = moveX - this.offsetMoveX;
  this.selected.y = moveY - this.offsetMoveY;

  // 实时更新位置属性
  this.propertyPositionInput.value = this.selected.position();

  this.render();
};