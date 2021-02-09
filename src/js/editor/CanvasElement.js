
////////////////////////////////////////////////////////////////////////////////
//
// CANVAS
//
////////////////////////////////////////////////////////////////////////////////

/**
 * 【报表基本元素】
 * @constructor
 */
function CanvasElement() {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
}

CanvasElement.prototype.isSelected = function () {
  return this.model.selected;
};

CanvasElement.prototype.select = function (x, y) {
  let model = this.model;
  this.model.selected =  (x >= model.x && x <= (model.x + model.width) && y >= model.y && y <= (model.y + model.height));
  return this.model.selected;
};

CanvasElement.prototype.unselect = function () {
  this.model.selected = false;
};

CanvasElement.prototype.render = function (context) {
  this.renderer.render(context, this);
};

CanvasElement.prototype.addModelChangedListener = function(listener) {
  this.modelChangedListeners.push(listener);
};

CanvasElement.prototype.notifyModelChangedListeners = function(model) {
  for (let key in model) {
    this.model[key] = model[key];
  }
  for (let i = 0; i < this.modelChangedListeners.length; i++) {
    this.modelChangedListeners[i].onModelChanged(model);
  }
};

////////////////////////////////////////////////////////////////////////////////
//
// TEXT
//
////////////////////////////////////////////////////////////////////////////////

/**
 * The text element on canvas.
 *
 * @param opts
 *        the options for text element
 *
 * @constructor
 */
function TextElement(opts) {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.model.fontFamily = opts.fontFamily || '宋体';
  this.model.fontSize = opts.fontSize || 18;
  this.model.fontColor = 'black';
  this.model.height = this.model.fontSize;
  this.model.type = 'text';
  this.model.id = this.model.type + '-' + moment().valueOf();
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new TextElementRenderer();
}

TextElement.typename = 'text';

TextElement.prototype.render = function(context, element) {
  let model = element.model;
  context.fillStyle = model.fontColor;
  context.font = model.font();

  model.width = context.measureText(model.text).width;

  // 文本的高度设置特殊性
  model.height = parseInt(model.fontSize);

  if (element.model.selected) {
    // 只有选择了的才能触发此逻辑，主要显示字体的调整，宽度随之调整
    element.notifyModelChangedListeners({
      width: model.width,
      height: model.height
    });
  }

  context.fillText(model.text, model.x, model.y + model.height * 0.85);

  this.renderSelected(context, model);
};

TextElement.prototype.getProperties = function () {
  return [{
    title: '显示',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 0
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 0
    }]
  },{
    title: '文本',
    properties: [{
      id: 'text',
      label: '文本',
      input: 'textarea',
      value: this.model.text || ''
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.model.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体']
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.model.fontSize || 16,
      min: '10',
      max: '60'
    },{
      id: 'fontColor',
      label: '字体颜色',
      input: 'color',
      value: this.model.color || 'black',
    }]
  }];
};

Object.assign(TextElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// LONG TEXT
//
////////////////////////////////////////////////////////////////////////////////

/**
 * long text element type.
 *
 * @param opts
 * @constructor
 */
function LongtextElement(opts) {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.model.fontFamily = opts.fontFamily || '宋体';
  this.model.fontSize = opts.fontSize || 18;
  this.model.fontColor = 'black';
  this.model.height = 100;
  this.model.width = 200;
  this.model.lineSpace = 5;
  this.model.type = 'longtext';
  this.model.alignment = 'left';
  this.model.id = this.model.type + '-' + moment().valueOf();
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new LongtextElementRenderer();
}

LongtextElement.typename = 'longtext';

LongtextElement.prototype.getProperties = function () {
  return [{
    title: '显示',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 0
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 0
    }]
  },{
    title: '文本',
    properties: [{
      id: 'text',
      label: '文本',
      input: 'textarea',
      value: this.model.text || ''
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.model.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体']
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.model.fontSize || 16,
      min: '10',
      max: '60'
    },{
      id: 'fontColor',
      label: '字体颜色',
      input: 'color',
      value: this.model.color || 'black',
    },{
      id: 'lineSpace',
      label: '行间距',
      input: 'range',
      unit: 'px',
      value: this.model.lineSpace || 5,
      min: '0',
      max: '20'
    }]
  },{
    title: '对齐',
    properties: [{
      id: 'alignment',
      label: '水平',
      input: 'alignment',
      value: this.model.alignment || '',
      display: function (val) {
        function handleClick(button) {
          let buttons = button.parentElement.querySelectorAll('button');
          buttons.forEach((btn) => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
          })
          button.classList.remove('btn-secondary');
          button.classList.add('btn-primary');
        }
        let buttons = document.createElement('div');
        buttons.style.display = 'block';
        buttons.classList.add('btn-group');
        let left = document.createElement('button');
        left.classList.add('btn', 'btn-sm');
        if (val == 'left') {
          left.classList.add('btn-primary');
        } else {
          left.classList.add('btn-secondary')
        }
        left.innerHTML = '<i class="fas fa-align-left"></i>';
        left.addEventListener('click', function() {
          handleClick(left);
        });
        let center = document.createElement('button');
        center.classList.add('btn', 'btn-sm');
        if (val == 'center') {
          center.classList.add('btn-primary');
        } else {
          center.classList.add('btn-secondary')
        }
        center.innerHTML = '<i class="fas fa-align-center"></i>';
        center.addEventListener('click', function() {
          handleClick(center);
        });
        let right = document.createElement('button');
        right.classList.add('btn', 'btn-sm');
        if (val == 'right') {
          right.classList.add('btn-primary');
        } else {
          right.classList.add('btn-secondary')
        }
        right.innerHTML = '<i class="fas fa-align-right"></i>';
        right.addEventListener('click', function() {
          handleClick(right);
        });

        buttons.append(left);
        buttons.append(center);
        buttons.append(right);
        return buttons;
      }
    }]
  }];
};

Object.assign(LongtextElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// IMAGE
//
////////////////////////////////////////////////////////////////////////////////

/**
 * the image element type.
 */
function ImageElement(opts) {
  this.model = {};
  this.modelChangedListeners = [];
  this.model.type = 'image';
  this.model.width = 350;
  this.model.height = 300;
  this.model.id = this.model.type + '-' + moment().valueOf();
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new ImageElementRenderer();
}

ImageElement.typename = 'image';

ImageElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 350
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 300
    }]
  }, {
    title: '图片',
    properties: [{
      id: 'image',
      label: '图片',
      input: 'file',
      value: this.model.file || ''
    }]
  }];
};

Object.assign(ImageElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// TABLE
//
////////////////////////////////////////////////////////////////////////////////

/**
 * the table element type.
 */
function TableElement(opts) {
  this.model = {};
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.modelChangedListeners = [];
  this.model.type = 'table';
  this.model.id = this.model.type + '-' + moment().valueOf();
  this.model.width = 600;
  this.model.height = 240;
  this.model.fontColor = 'black';
  this.model.fontSize = 12;
  this.model.fontFamily = Canvas.TEXT_FONT_FAMILY;
  this.model.columns =  '商品;单价;数量;总价';
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new TableElementRenderer();
}

TableElement.typename = 'table';

TableElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 600
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 400
    }]
  }, {
    title: '表格',
    properties: [{
      id: 'columns',
      label: '列',
      input: 'textarea',
      value: this.model.columns || ''
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.model.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体']
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.model.fontSize || 16,
      min: '10',
      max: '60'
    },{
      id: 'fontColor',
      label: '字体颜色',
      input: 'color',
      value: this.model.color || 'black',
    }]
  }];
};

Object.assign(TableElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// CHART
//
////////////////////////////////////////////////////////////////////////////////

/**
 * the chart element type.
 */
function ChartElement(opts) {
  this.model = {};
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.modelChangedListeners = [];
  this.model.type = 'chart';
  this.model.id = this.model.type + '-' + moment().valueOf();
  this.model.width = 500;
  this.model.height = 360;
  this.model.fontSize = 12;
  this.model.fontFamily = Canvas.TEXT_FONT_FAMILY;
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new ChartElementRenderer();
}

ChartElement.typename = 'chart';

ChartElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 600
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 400
    }]
  }, {
    title: '图表',
    properties: [{
      id: 'subtype',
      label: '类型',
      input: 'select',
      value: this.model.subtype || '',
      values: ['饼图','柱状图','折线图','仪表图']
    }]
  }];
};

Object.assign(ChartElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// VIDEO
//
////////////////////////////////////////////////////////////////////////////////

function VideoElement(opts) {
  this.model = {};
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.modelChangedListeners = [];
  this.model.type = 'video';
  this.model.id = this.model.type + '-' + moment().valueOf();
  this.model.width = 427;
  this.model.height = 240;
  this.model.fontSize = 12;
  this.model.fontFamily = Canvas.TEXT_FONT_FAMILY;
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.model.sample = 'img/av/ad_health.mp4';
  this.renderer = new VideoElementRenderer();
}

VideoElement.typename = 'video';

VideoElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 600
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 400
    }]
  }];
};

Object.assign(VideoElement.prototype, CanvasElement.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// QUEUE
//
////////////////////////////////////////////////////////////////////////////////

/**
 * the table element type.
 */
function QueueElement(opts) {
  this.model = {};
  this.model.font = function () {
    return this.fontSize + 'px ' + this.fontFamily;
  };
  this.modelChangedListeners = [];
  this.model.type = 'table';
  this.model.id = this.model.type + '-' + moment().valueOf();
  this.model.width = 360;
  this.model.height = 240;
  this.model.fontColor = 'black';
  this.model.fontSize = 12;
  this.model.fontFamily = Canvas.TEXT_FONT_FAMILY;
  this.model.columns =  '序号;姓名';
  for (let key in opts) {
    this.model[key] = opts[key];
  }
  this.renderer = new QueueElementRenderer();
}

QueueElement.typename = 'queue';

QueueElement.prototype.getProperties = function () {
  return [{
    title: '位置',
    properties: [{
      id: 'x',
      label: '左',
      input: 'number',
      value: this.model.x || 0
    }, {
      id: 'y',
      label: '顶',
      input: 'number',
      value: this.model.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.model.width || 600
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.model.height || 400
    }]
  }, {
    title: '表格',
    properties: [{
      id: 'columns',
      label: '列',
      input: 'textarea',
      value: this.model.columns || ''
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.model.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体']
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.model.fontSize || 16,
      min: '10',
      max: '60'
    },{
      id: 'fontColor',
      label: '字体颜色',
      input: 'color',
      value: this.model.color || 'black',
    }]
  }];
};

Object.assign(QueueElement.prototype, CanvasElement.prototype);