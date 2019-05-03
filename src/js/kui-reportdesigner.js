
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
    text: text,
    type: 'text',
    font: ReportDesigner.TEXT_FONT,
    x: x,
    y: y,
    height: 18,
    selected: false
  };
  this.objects.push(textObj);
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
  ctx.fillStyle = textObj.color || 'black';
  ctx.font = textObj.font || this.TEXT_FONT;

  ctx.fillText(textObj.text, textObj.x, textObj.y + textObj.height);
  
  textObj.width = ctx.measureText(textObj.text).width;

  if (textObj.selected) {
    var offsetX = 5;
    var offsetY = 2;
    ctx.strokeStyle = 'red';
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

  var tableObj = {
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

  this.objects.push(tableObj);

  this.renderTable(tableObj);
};

ReportDesigner.prototype.renderTable = function (tableObj) {
  var ctx = this.canvas.getContext('2d');

  if (tableObj.selected) {
    ctx.strokeStyle = 'red';
  } else {
    ctx.strokeStyle = 'black';
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
  ctx.fillText(tableObj.columns[0].title, tableObj.x + 30, tableObj.y + 30);
};

ReportDesigner.prototype.addImage = function (x, y) {
  var imageObj = {
    type: 'image',
    x: x,
    y: y,
    width: 100,
    height: 100,
    url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1556728168256&di=6efb222c1a2172858bbdb1e9832944e9&imgtype=jpg&src=http%3A%2F%2Fbaike.chachaba.com%2Fimg%2F2013%2F05%2F22%2F18281014843.png'
  };
  
  this.objects.push(imageObj);

  this.renderImage(imageObj);
};

ReportDesigner.prototype.renderImage = function (imageObj) {
  var ctx = this.canvas.getContext('2d');

  var img = document.getElementById('test_image');
  // img.src = imageObj.url;

  // img.onload = function () {
    ctx.drawImage(img, 0, 0, 200, 200, imageObj.x, imageObj.y, imageObj.width, imageObj.height);
  // };

  if (imageObj.selected) {
    console.log('image selected');
  }
};

ReportDesigner.prototype.drawDotLines = function () {
  var ctx = this.canvas.getContext('2d');
  var r = 2, cw = 20, ch = 20;
  for (var x = 4; x < vw; x += cw) {
    for (var y = 4; y < vh; y += ch) {
      ctx.fillStyle = '#000000';   
      ctx.fillRect(x - r / 2, y - r / 2, r, r);
    }
  }
};

ReportDesigner.prototype.render = function () {
  // 画网格线
  // this.drawDotLines();
  var ctx = this.canvas.getContext('2d');
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  for (var i = 0; i < this.objects.length; i++) {
    var obj = this.objects[i];
    if (obj.type == 'text') {
      this.renderText(obj);
    } else if (obj.type == 'table') {
      this.renderTable(obj);
    } else if (obj.type == 'image') {
      this.renderImage(obj);
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

  // render again if selected or not
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

  this.render();
};