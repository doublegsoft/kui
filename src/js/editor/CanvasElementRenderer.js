////////////////////////////////////////////////////////////////////////////////
//
// CANVAS
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the base renderer.
 *
 * @constructor
 */
function CanvasElementRenderer() {

}

CanvasElementRenderer.prototype.renderSelected = function(context, model) {
  if (model.selected) {
    context.setLineDash([]);

    context.beginPath();
    context.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
    // left-top
    context.moveTo(model.x, model.y);
    // left-bottom
    context.lineTo(model.x, model.y + model.height);
    // right-bottom
    context.lineTo(model.x + model.width, model.y + model.height);
    // right-top
    context.lineTo(model.x + model.width, model.y);
    // left-top
    context.lineTo(model.x, model.y);
    context.stroke();
    context.closePath();
  }
};

////////////////////////////////////////////////////////////////////////////////
//
// TEXT
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for text element.
 *
 * @constructor
 */
function TextElementRenderer() {

}

TextElementRenderer.prototype.render = function(context, element) {
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

Object.assign(TextElementRenderer.prototype, CanvasElementRenderer.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// LONG TEXT
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for long text element.
 *
 * @constructor
 */
function LongtextElementRenderer() {

}

LongtextElementRenderer.prototype.render = function(context, element) {
  let model = element.model;
  context.fillStyle = model.fontColor;
  context.font = model.font();

  let lineHeight = model.fontSize + model.lineSpace;
  let line = '';
  let x = model.x;
  let y = model.y + lineHeight;
  let height = 0;
  let chars = model.text.split('');
  for(let i = 0; i < chars.length; i++) {
    line += chars[i];
    let metrics = context.measureText(line);
    let testWidth = metrics.width;
    if (testWidth > model.width && i > 0) {
      context.fillText(line.substr(0, line.length - 1), x, y);
      line = chars[i];
      y += lineHeight;
      height += lineHeight;
    }
  }
  if (line != '') {
    height += lineHeight + model.lineSpace;
    context.fillText(line, x, y);
  }

  model.height = height;

  this.renderSelected(context, model);
};

Object.assign(LongtextElementRenderer.prototype, CanvasElementRenderer.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// IMAGE
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for image element.
 *
 * @constructor
 */
function ImageElementRenderer() {

}

ImageElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  if (model.image) {
    let containerImage = document.getElementById('image_container');
    let img = document.getElementById(model.id);
    if (img == null) {
      let img = document.createElement('img');
      img.setAttribute('id', model.id);
      img.setAttribute('src', model.image);
      img.onload = function () {
        let sWidth = img.naturalWidth;
        let sHeight = img.naturalHeight;
        context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
      };
      containerImage.append(img);
    } else {
      let sWidth = img.naturalWidth;
      let sHeight = img.naturalHeight;
      img.setAttribute('src', model.image);
      context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
    }
  } else {
    let img = document.getElementById(model.id);
    if (img == null) {
      img = document.getElementById('image_sample')
    }
    let sWidth = img.naturalWidth;
    let sHeight = img.naturalHeight;
    context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
  }

  this.renderSelected(context, model);
};

Object.assign(ImageElementRenderer.prototype, CanvasElementRenderer.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// TABLE
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for table element.
 *
 * @constructor
 */
function TableElementRenderer() {

}

TableElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  // context.font = model.font();
  context.fillStyle = model.fontColor;

  if (model.selected) {
    context.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
  } else {
    context.strokeStyle = ReportDesigner.STROKE_STYLE_DEFAULT;
  }
  context.setLineDash([]);
  context.strokeStyle = ReportDesigner.STROKE_STYLE_DEFAULT;

  // 画边框
  context.beginPath();
  // left-top
  context.moveTo(model.x, model.y);
  // left-bottom
  context.lineTo(model.x, model.y + model.height);
  // right-bottom
  context.lineTo(model.x + model.width, model.y + model.height);
  // right-top
  context.lineTo(model.x + model.width, model.y);
  // left-top
  context.lineTo(model.x, model.y);
  context.stroke();
  context.closePath();

  let columnTitles = model.columns.split(';');
  let columnCount = columnTitles.length;
  let columnWidth = parseInt(model.width / (columnCount == 0 ? 1 : columnCount));
  let headerHeight = model.fontSize * 1.25;

  // 画【列】的竖线
  for (let i = 1; i < columnCount; i++) {
    context.beginPath();
    context.moveTo(model.x + columnWidth * i, model.y);
    context.lineTo(model.x + columnWidth * i, model.y + model.height);
    context.stroke();
    context.closePath();
  }
  // 画【表头】的横线
  context.beginPath();
  context.moveTo(model.x, model.y + headerHeight);
  context.lineTo(model.x + model.width, model.y + headerHeight);
  context.stroke();
  context.closePath();
  // 画【表头】的标题
  context.font = model.font();
  for (let i = 0; i < columnCount; i++) {
    let title = columnTitles[i];
    let titleWidth = context.measureText(title).width;
    let titleX = model.x + (columnWidth - titleWidth) / 2 + columnWidth * i;
    context.fillText(title, titleX, model.y + model.fontSize * 1.0);
  }

  this.renderSelected(context, model);
};

Object.assign(TableElementRenderer.prototype, CanvasElementRenderer.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// CHART
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for chart element.
 */
function ChartElementRenderer() {

}

ChartElementRenderer.options = {
  gauge: {
    animation: false,
    series: [{
      radius: '100%',
      center: ['50%', '55%'],
      name: '业务指标',
      type: 'gauge',
      detail: {formatter: '{value}%'},
      data: [{value: 75, name: '完成率'}]
    }]
  },
  bar: {
    animation: false,
    grid: {
      left: 30,
      right: 10,
      top: 10,
      bottom: 20
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }]
  },
  pie: {
    animation: false,
    title: {
      text: '',
      left: 'center'
    },
    series: [{
      name: '访问来源',
      type: 'pie',
      radius: '90%',
      center: ['50%', '50%'],
      data: [
        {value: 335, name: '直接访问'},
        {value: 310, name: '邮件营销'},
        {value: 234, name: '联盟广告'},
        {value: 135, name: '视频广告'},
        {value: 1548, name: '搜索引擎'}
      ]
    }]
  },
  line: {
    animation: false,
    grid: {
      left: 40,
      right: 10,
      top: 10,
      bottom: 20
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line'
    }]
  }
};

ChartElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  let containerImage = document.getElementById('image_container');
  let div = document.getElementById('div-' + model.id);
  let img = document.getElementById('img-' + model.id);

  let sWidth = model.width;
  let sHeight = model.height;

  if (div == null) {
    div = document.createElement('div');
    img = document.createElement('img');

    img.onload = function () {
      sWidth = img.naturalWidth;
      sHeight = img.naturalHeight;
      context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
      img.onload = null;
    };

    containerImage.append(div);
    containerImage.append(img);
  }
  img.setAttribute('id', 'img-' + model.id);
  img.setAttribute('width', model.width);
  img.setAttribute('height', model.height);
  div.setAttribute('id', 'div-' + model.id);
  div.style.height = model.height + 'px';
  div.style.width = model.width + 'px';
  div.removeAttribute('_echarts_instance_');

  let echart = echarts.init(div);
  if (model.subtype == '饼图') {
    echart.setOption(ChartElementRenderer.options.pie);
  } else if (model.subtype == '柱状图') {
    echart.setOption(ChartElementRenderer.options.bar);
  } else if (model.subtype == '折线图') {
    echart.setOption(ChartElementRenderer.options.line);
  } else if (model.subtype == '仪表图') {
    echart.setOption(ChartElementRenderer.options.gauge);
  }
  // 修复改变图表子类型而无法刷新页面的问题。
  if (this.latestSubtype != model.subtype) {
    img.onload = function () {
      sWidth = img.naturalWidth;
      sHeight = img.naturalHeight;
      context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
      img.onload = null;
    };
  }
  this.latestSubtype = model.subtype;

  let image = echart.getDataURL();
  img.setAttribute('src', image);
  if (!img.onload) {
    sWidth = img.naturalWidth;
    sHeight = img.naturalHeight;
    context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
  }

  this.renderSelected(context, model);
};

Object.assign(ChartElementRenderer.prototype, CanvasElementRenderer.prototype);

////////////////////////////////////////////////////////////////////////////////
//
// VIDEO
//
////////////////////////////////////////////////////////////////////////////////

function VideoElementRenderer() {

}

VideoElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  let containerVideo = document.getElementById('video_container');
  // let video = dom.element('<video id="videoSample" autoplay loop></video>');
  // video.src = model.sample;
  // containerVideo.appendChild(video);

  function renderFrame() {
    // context.globalCompositeOperation = "source-over";
    // context.clearRect(0, 0, c.width, c.height);     // makes sure we have an alpha channel

    // context.beginPath();                            // draw diagonal half
    // context.moveTo(model.x, model.y);
    // context.lineTo(pos - 50, 0);
    // context.lineTo(pos + 50, c.height);
    // context.lineTo(0, c.height);
    // context.fill();

    // // video source 2
    // ctx.globalCompositeOperation = "source-in";        // comp in source 2
    // ctx.drawImage(video2, 0, 0, c.width, c.height);

    // video source 1
    // context.globalCompositeOperation = "destination-atop"; // comp in source 1
    context.drawImage(video, model.x, model.y, model.width, model.height);

    requestAnimationFrame(renderFrame);
  }

  // video.oncanplay = function() { renderFrame() };

  if (model.image) {
    let containerImage = document.getElementById('image_container');
    let img = document.getElementById(model.id);
    if (img == null) {
      let img = document.createElement('img');
      img.setAttribute('id', model.id);
      img.setAttribute('src', model.image);
      img.onload = function () {
        let sWidth = img.naturalWidth;
        let sHeight = img.naturalHeight;
        context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
      };
      containerImage.append(img);
    } else {
      let sWidth = img.naturalWidth;
      let sHeight = img.naturalHeight;
      img.setAttribute('src', model.image);
      context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
    }
  } else {
    let img = document.getElementById(model.id);
    if (img == null) {
      img = document.getElementById('image_poster')
    }
    let sWidth = img.naturalWidth;
    let sHeight = img.naturalHeight;
    context.drawImage(img, 0, 0, sWidth, sHeight, model.x, model.y, model.width, model.height);
  }

  this.renderSelected(context, model);
};

Object.assign(VideoElementRenderer.prototype, CanvasElementRenderer.prototype);


////////////////////////////////////////////////////////////////////////////////
//
// TABLE
//
////////////////////////////////////////////////////////////////////////////////
/**
 * the renderer for table element.
 *
 * @constructor
 */
function QueueElementRenderer() {

}

QueueElementRenderer.prototype.render = function (context, element) {
  let model = element.model;
  // context.font = model.font();
  context.fillStyle = model.fontColor;

  if (model.selected) {
    context.strokeStyle = ReportDesigner.STROKE_STYLE_SELECTED;
  } else {
    context.strokeStyle = ReportDesigner.STROKE_STYLE_DEFAULT;
  }
  context.setLineDash([]);
  context.strokeStyle = ReportDesigner.STROKE_STYLE_DEFAULT;

  // 画边框
  context.beginPath();
  // left-top
  context.moveTo(model.x, model.y);
  // left-bottom
  context.lineTo(model.x, model.y + model.height);
  // right-bottom
  context.lineTo(model.x + model.width, model.y + model.height);
  // right-top
  context.lineTo(model.x + model.width, model.y);
  // left-top
  context.lineTo(model.x, model.y);
  context.stroke();
  context.closePath();

  let columnTitles = model.columns.split(';');
  let columnCount = columnTitles.length;
  let columnWidth = parseInt(model.width / (columnCount == 0 ? 1 : columnCount));
  let headerHeight = model.fontSize * 1.25;

  // 画【列】的竖线
  // for (let i = 1; i < columnCount; i++) {
  //   context.beginPath();
  //   context.moveTo(model.x + columnWidth * i, model.y);
  //   context.lineTo(model.x + columnWidth * i, model.y + model.height);
  //   context.stroke();
  //   context.closePath();
  // }
  // 画【表头】的横线
  context.beginPath();
  context.moveTo(model.x, model.y + headerHeight);
  context.lineTo(model.x + model.width, model.y + headerHeight);
  context.stroke();
  context.closePath();
  // 画【表头】的标题
  context.font = model.font();
  for (let i = 0; i < columnCount; i++) {
    let title = columnTitles[i];
    let titleWidth = context.measureText(title).width;
    let titleX = model.x + (columnWidth - titleWidth) / 2 + columnWidth * i;
    context.fillText(title, titleX, model.y + model.fontSize * 1.0);
  }

  this.renderSelected(context, model);
};

Object.assign(QueueElementRenderer.prototype, CanvasElementRenderer.prototype);